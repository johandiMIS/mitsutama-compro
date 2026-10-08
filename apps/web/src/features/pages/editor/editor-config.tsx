"use client";

import type { Config, Fields } from "@puckeditor/core";
import { pageConfig, type BlockProps } from "../config";
import { badgesField, imageField, stringListField } from "./fields";

type AnyFields = Fields<Record<string, unknown>>;

/**
 * The editor's view of `pageConfig`: same blocks, same `render`, with the form fields added.
 * Fields live here rather than in `config.tsx` so the public site never ships editor code.
 * Each field reads and writes exactly the shape the API's zod schemas validate.
 */
const fieldsByBlock: { [K in keyof BlockProps]: AnyFields } = {
  ProductIntro: {
    tagline: { type: "text" },
    title: { type: "text" },
    paragraphs: stringListField("Paragraphs", "Add paragraph", true),
    image: imageField(),
    imageSide: {
      type: "radio",
      label: "Image side",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  } as AnyFields,
  CategorizedProducts: {
    tagline: { type: "text" },
    title: { type: "text" },
    intro: { type: "textarea" },
    categories: {
      type: "array",
      getItemSummary: (item: Record<string, unknown>) => String(item.name ?? "") || "Category",
      defaultItemProps: { name: "New category", products: [] },
      arrayFields: {
        name: { type: "text", label: "Category name" },
        products: {
          type: "array",
          getItemSummary: (item: Record<string, unknown>) => String(item.name ?? "") || "Product",
          defaultItemProps: { name: "New product", badges: [], bullets: [] },
          arrayFields: {
            name: { type: "text" },
            model: { type: "text" },
            image: imageField(),
            badges: badgesField(),
            bullets: stringListField("Bullet points", "Add bullet"),
            href: { type: "text", label: "Link (/path or https://…)" },
          },
        },
      },
    },
  } as unknown as AnyFields,
  SectionHeading: {
    tagline: { type: "text" },
    title: { type: "text" },
    intro: { type: "textarea" },
  } as AnyFields,
  RichText: {
    body: { type: "textarea", label: "Body (Markdown: paragraphs, - lists, **bold**, [links](/path))" },
  } as AnyFields,
  TextImage: {
    title: { type: "text" },
    body: { type: "textarea" },
    image: imageField(),
    imageSide: {
      type: "radio",
      label: "Image side",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
  } as AnyFields,
  SpecTable: {
    title: { type: "text" },
    rows: {
      type: "array",
      getItemSummary: (item: Record<string, unknown>) => String(item.label ?? "") || "Row",
      defaultItemProps: { label: "", value: "" },
      arrayFields: { label: { type: "text" }, value: { type: "text" } },
    },
  } as unknown as AnyFields,
  FeatureGrid: {
    items: {
      type: "array",
      getItemSummary: (item: Record<string, unknown>) => String(item.title ?? "") || "Feature",
      defaultItemProps: { title: "", text: "" },
      arrayFields: { title: { type: "text" }, text: { type: "textarea" } },
    },
  } as unknown as AnyFields,
  ContactCta: {} as AnyFields,
};

export const editorConfig = {
  ...pageConfig,
  components: Object.fromEntries(
    Object.entries(pageConfig.components).map(([name, component]) => [
      name,
      { ...component, fields: fieldsByBlock[name as keyof BlockProps] },
    ]),
  ),
} as unknown as Config;
