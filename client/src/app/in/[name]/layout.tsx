import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  const { name } = await params;

  try {
    const response = await fetch(
      `http://localhost:5000/api/v1/user/profile?username=${name}`,
      {
        method: "GET",
      }
    );
    const { user } = await response.json();
    return {
      title: `Profile - ${user.name}`,
      description: `This is the profile page of ${user.name}. ${
        user.about || ""
      }`,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return {
      title: "page not found",
      description: `This is the profile page of user not found`,
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
