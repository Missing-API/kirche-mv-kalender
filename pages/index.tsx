import { GetStaticProps, InferGetStaticPropsType } from "next";
import { createSwaggerSpec } from "next-swagger-doc";
import "swagger-ui-react/swagger-ui.css";
import dynamic from "next/dynamic";
import { organizerName } from "../src/constants";
import { Categories } from "../src/categories";

const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <h1>{organizerName}</h1>
      <ul>
        {Categories.map((c) => {
          const icsUrl: string = `/api/${c.slug}.ics`;
          return (
            <li key={c.externalId}>
              {c.name}: <a href={icsUrl}>{icsUrl}</a>
            </li>
          );
        })}
      </ul>
      <SwaggerUI spec={spec} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "kirche-mv.de ICS middleware",
        version: "1.0",
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
