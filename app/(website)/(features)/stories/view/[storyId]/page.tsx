const Page = async ({ params }: { params: { storyId: string } }) => {
  const { storyId } = params;
  return <div>{storyId}</div>;
};

export default Page;
