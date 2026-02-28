const Page = async ({ params }: { params: { username: string } }) => {
  const { username } = await params;
  return <div>Page : {username}</div>;
};

export default Page;
