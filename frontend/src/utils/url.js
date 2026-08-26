


  export async function getAllConversations(API_BASE) {
    try {
      const response = await fetch(`${API_BASE}/api/conversations`);
    const data = await response.json();

    console.log("this is the data", data);

    return data;

    
    } catch (error) {

      console.log("this is the error", error)
      
    }
}