export interface BatchWhatsAppParams {
  to: (string | { phone: string; text?: string })[]; // List of phone numbers or objects
  text?: string; // Fallback text
  type?: "template" | "text";
  data?: any;
}

const getBackendUrl = () =>
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const sendBatchWhatsApp = async (
  params: BatchWhatsAppParams
): Promise<any> => {
  try {
    const response = await fetch(`${getBackendUrl()}/whatsapp/batch-notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send batch WhatsApp");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending batch WhatsApp:", error);
    throw error;
  }
};
