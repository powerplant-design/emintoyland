import { $fetch } from "ofetch";

export default async function () {
  const api = "http://localhost:8000/api/query";

  const response = await $fetch(api, {
    method: "post",
    body: {
      query: "site.children",
      select: {
        title: true,
        slug: true,
        uuid: true,
      },
    },
  });

  return response.result;
}
