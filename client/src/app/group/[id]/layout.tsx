import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await fetch(`http://localhost:5000/api/v1/group/${id}`, {
      method: "GET",
    });
    const group = await response.json();
    return {
      title: `Group - ${group.name}`,
      description: `This is the group page of ${group.name}. ${
        group.about || ""
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
  return (
    <>
      {children}
      <div className="h-16"></div>
    </>
  );
}
