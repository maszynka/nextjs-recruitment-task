export async function handleDbAction<T>(
  action: () => Promise<T>
): Promise<T | { error: string }> {
  try {
    return await action();
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        message =
          "Cannot connect to the database. Please check your database server.";
      } else if (error.message.includes("password authentication failed")) {
        message =
          "Database authentication failed. Please check your credentials.";
      } else {
        message = error.message;
      }
      console.error(error);
    }
    return { error: message };
  }
}
