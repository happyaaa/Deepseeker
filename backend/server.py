import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from tavily import TavilyClient
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    base_url="https://api.keywordsai.co/api/",
    api_key=os.getenv("KEYWORDS_AI_API_KEY")
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Ensure these prompt IDs exist in Keywords AI
PLANNER_PROMPT_ID = os.getenv("PLANNER_PROMPT_ID")
CRITIC_PROMPT_ID = os.getenv("CRITIC_PROMPT_ID")
REPORTER_PROMPT_ID = os.getenv("REPORTER_PROMPT_ID")

class ResearchRequest(BaseModel):
    query: str

def call_keywords_agent(prompt_id, variables, trace_name, fallback_content=None):
    """Generic Keywords AI prompt invocation."""
    if not prompt_id:
        print(f"❌ Error: Prompt ID for {trace_name} is missing/None!")
        return fallback_content
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "placeholder"}],
            extra_body={
                "prompt": {
                    "prompt_id": prompt_id,
                    "variables": variables,
                    "override": True,
                },
                "keywords_ai_params": {"trace_name": trace_name},
            },
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"❌ Agent Error ({trace_name}): {e}")
        return fallback_content

def perform_search(query):
    print(f"🔎 Tavily Searching: {query}...")
    try:
        tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        # Use basic depth for faster, cheaper retrieval
        response = tavily.search(query=query, search_depth="basic", max_results=2)
        
        results = response.get("results", [])
        if not results:
            return None, []  # No results
            
        context = []
        sources = []
        for result in results:
            context.append(
                "Source Title: {title}\nSource URL: {url}\nContent: {content}...".format(
                    title=result["title"],
                    url=result["url"],
                    content=result["content"][:500],
                )
            )
            sources.append(
                {"title": result.get("title", ""), "url": result.get("url", "")}
            )
        return "\n\n".join(context), sources
    except Exception as e:
        print(f"⚠️ Search Error: {e}")
        return None, []

@app.post("/api/research")
async def start_research(request: ResearchRequest):
    query = request.query
    logs = []
    
    # --- Phase 1: Planning ---
    logs.append({"step": "planning", "status": "running", "message": "🧠 Decomposing research task..."})
    raw_plan = call_keywords_agent(
        prompt_id=PLANNER_PROMPT_ID,
        variables={"query": query},
        trace_name="planner_agent",
        fallback_content=json.dumps({"steps": [query]}),
    )
    try:
        steps = json.loads(raw_plan).get("steps", [])
    except:
        steps = [query]
    
    collected_context = ""
    collected_sources = []
    
    # --- Phase 2: Execution with Self-Correction ---
    for i, step in enumerate(steps):
        logs.append({"step": "searching", "status": "running", "message": f"🕵️ Step {i+1}: {step}"})

        result, sources = perform_search(step)
        
        # === Critic Loop ===
        if not result or len(result) < 50:
            logs.append({
                "step": "warning",
                "status": "retry",
                "message": f"⚠️ Search failed for '{step}'. Attempting self-correction..."
            })
            
            # Ask the Critic to rewrite the query (Prompt Management)
            refined_query = call_keywords_agent(
                prompt_id=CRITIC_PROMPT_ID,
                variables={"failed_query": step},
                trace_name="critic_agent",
                fallback_content=step,
            )
            
            logs.append({
                "step": "retry",
                "status": "retry",
                "message": f"🔄 Retrying with: {refined_query}"
            })
            # Retry search
            result, sources = perform_search(refined_query)
            
            if result:
                logs.append({"step": "success", "status": "success", "message": "✅ Retry successful!"})
            else:
                logs.append({"step": "error", "status": "error", "message": "❌ Retry failed. Moving on."})
        
        if result:
            collected_context += f"## Source: {step}\n{result}\n\n"
            collected_sources.extend([s for s in sources if s.get("url")])

    # --- Phase 3: Reporting ---
    logs.append({"step": "reporting", "status": "running", "message": "📝 Compiling final intelligence report..."})
    
    final_report = call_keywords_agent(
        prompt_id=REPORTER_PROMPT_ID,
        variables={
            "query": query,
            "context": collected_context,
        },
        trace_name="reporter_agent",
        fallback_content="Failed to generate report.",
    )

    # === Save to Supabase ===
    try:
        supabase.table("reports").insert(
            {
                "query": query,
                "markdown_content": final_report,
                "logs": logs,
                "sources": collected_sources,
            }
        ).execute()
        print("✅ Saved to Supabase!")
    except Exception as e:
        print(f"⚠️ Supabase Save Error: {e}")

    return {
        "status": "success",
        "final_report": final_report,
        "process_logs": logs,
        "sources": collected_sources
    }

@app.get("/api/history")
def get_history():
    try:
        response = supabase.table("reports").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception:
        return []

@app.delete("/api/history/{report_id}")
def delete_history(report_id: int):
    try:
        supabase.table("reports").delete().eq("id", report_id).execute()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
