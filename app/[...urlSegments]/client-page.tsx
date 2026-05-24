"use client";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export default function ClientPage({ data }: { data: any }) {
  return <TinaMarkdown content={data._body} />;
}
