import { supabase } from "./client.ts";

const TABLE_NAME = "rag_session";

interface RagSession {
  rag_session_id: string;
  url: string;
}

async function create(session: RagSession) {
  const { error, data } = await supabase.from(TABLE_NAME)
    .insert(session);

  if (error) {
    console.log("error inserting data in ", TABLE_NAME, "error:", error);
    return;
  }

  console.log("inserted session successfully", data);
}

async function getById(id: string) {
  console.log("getting rag session for id", id);
  const resource = await supabase.from(TABLE_NAME)
    .select();

  if (resource.error) {
    console.error("error getting rag_session_detail for id", id);
    return;
  }

  console.log("rag_session_details", resource);
}

async function getAll() {
  console.log("fetching all rag_sessions");
  const response = await supabase.from(TABLE_NAME)
    .select();

  if (response.error) {
    console.log("error getting rag_session_detail", response.error);
    return;
  }

  console.log("data >>", response.data);
}

export { create, getAll, getById };
