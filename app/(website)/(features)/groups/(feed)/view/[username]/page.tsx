const Page = async ({ params }: { params: { username: string } }) => {
  const { username } = await params;
  return (
    <div>
      Page : {username}
      <h1>Discussion Page</h1>
    </div>
  );
};

export default Page;
