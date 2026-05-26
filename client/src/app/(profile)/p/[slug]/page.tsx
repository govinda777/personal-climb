import PersonalProfileView from "@/components/PersonalProfileView";

export function generateStaticParams() {
  return [{ slug: "default" }, { slug: "govinda" }];
}

export default async function PersonalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PersonalProfileView slug={slug} />;
}
