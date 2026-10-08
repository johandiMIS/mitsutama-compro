import type { Config } from "@puckeditor/core";
import type { z } from "zod";
import type { BLOCK_SCHEMAS, BlockType } from "@compro/types";
import { CategorizedProducts } from "./blocks/CategorizedProducts";
import { ContactCtaBlock } from "./blocks/ContactCtaBlock";
import { FeatureGridBlock } from "./blocks/FeatureGridBlock";
import { ProductIntro } from "./blocks/ProductIntro";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { SectionHeadingBlock } from "./blocks/SectionHeadingBlock";
import { SpecTableBlock } from "./blocks/SpecTableBlock";
import { TextImageBlock } from "./blocks/TextImageBlock";

/** Props of every block, derived from the same zod schemas the API validates against. */
export type BlockProps = { [K in BlockType]: z.output<(typeof BLOCK_SCHEMAS)[K]> };

/**
 * The block set: one React component per block. Shared by the public renderer (`<Render>`)
 * and the admin editor, so what an editor previews is what the site renders. The API
 * validates every save against `BLOCK_SCHEMAS`, so a block the schema rejects can never
 * be published.
 *
 * Form fields are editor-only and live in `editor/editor-config.tsx`, so the public site
 * never ships editor code.
 */
export const pageConfig: Config<BlockProps> = {
  components: {
    ProductIntro: {
      label: "Product intro",
      defaultProps: { tagline: "", title: "", paragraphs: [], imageSide: "right" },
      render: (props) => <ProductIntro {...props} />,
    },
    CategorizedProducts: {
      label: "Categorised products",
      defaultProps: { tagline: "", title: "", intro: "", categories: [{ name: "", products: [] }] },
      render: (props) => <CategorizedProducts {...props} />,
    },
    SectionHeading: {
      label: "Section heading",
      defaultProps: { tagline: "", title: "", intro: "" },
      render: (props) => <SectionHeadingBlock {...props} />,
    },
    RichText: {
      label: "Rich text",
      defaultProps: { body: "" },
      render: (props) => <RichTextBlock {...props} />,
    },
    TextImage: {
      label: "Text and image",
      defaultProps: { title: "", body: "", image: { url: "", alt: "" }, imageSide: "right" },
      render: (props) => <TextImageBlock {...props} />,
    },
    SpecTable: {
      label: "Specification table",
      defaultProps: { title: "", rows: [{ label: "", value: "" }] },
      render: (props) => <SpecTableBlock {...props} />,
    },
    FeatureGrid: {
      label: "Feature grid",
      defaultProps: { items: [{ title: "", text: "" }] },
      render: (props) => <FeatureGridBlock {...props} />,
    },
    ContactCta: {
      label: "Contact call to action",
      defaultProps: {},
      render: (props) => <ContactCtaBlock {...props} />,
    },
  },
};
