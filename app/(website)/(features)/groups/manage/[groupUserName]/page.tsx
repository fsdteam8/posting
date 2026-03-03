const page = async ({ params }: { params: { groupUserName: string } }) => {
  const { groupUserName } = await params;
  return <div>page is managed with : {groupUserName}</div>;
};

export default page;
