export async function main() {
  return {
    body: JSON.stringify({message: 'Hiiiiiiiiiii from Lambda 🎉'}),
    statusCode: 200,
  };
}