import { connectDB } from "@/db/connection";

export default async function Home() {
  return (
    <>
      <h1>Home page</h1>
    </>
  );
}

async function fetchUsers() {
  // await wait(5);
  try {
    connectDB();
  } catch (error) {
    console.log("error connecting to DB while fetching");
  }
}

function wait(n: number) {
  return new Promise((resolve) => setTimeout(resolve, n * 1000));
}
