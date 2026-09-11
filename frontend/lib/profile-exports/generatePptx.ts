import pptxgenjs from "pptxgenjs";
import { company } from "@/data/company";
import { profileSlides } from "@/data/company-profile";

export async function generatePptxDeck(): Promise<void> {
  const pptx = new pptxgenjs();

  // 16:9 widescreen layout
  pptx.layout = "LAYOUT_16x9";
  pptx.author = company.name;
  pptx.company = company.name;
  pptx.subject = "Tauqeer Mustafa Inc. Official Company Profile & Capabilities Deck";
  pptx.title = "Tauqeer Mustafa Inc. - Company Profile";

  // Corporate Theme Colors
  const BG_DARK = "0D1117";
  const CARD_BG = "161B22";
  const TEXT_WHITE = "F0F6FC";
  const TEXT_MUTED = "8B949E";
  const ACCENT_BLUE = "2F81F7";
  const ACCENT_CYAN = "38BDF8";
  const BORDER_COLOR = "30363D";

  // Slide 1: Cover Slide
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };

    // Decorative Accent Bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.0,
      w: 0.15,
      h: 4.8,
      fill: { color: ACCENT_BLUE },
      line: { color: ACCENT_CYAN, width: 1 },
    });

    // Eyebrow
    slide.addText("OFFICIAL CAPABILITIES & PROFILE DECK", {
      x: 1.2,
      y: 1.0,
      w: 10.0,
      h: 0.4,
      fontSize: 12,
      fontFace: "Arial",
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 2,
    });

    // Company Name
    slide.addText(company.name, {
      x: 1.2,
      y: 1.4,
      w: 10.5,
      h: 1.2,
      fontSize: 40,
      fontFace: "Arial",
      bold: true,
      color: TEXT_WHITE,
    });

    // Tagline / Subtitle
    slide.addText(company.tagline, {
      x: 1.2,
      y: 2.6,
      w: 10.5,
      h: 0.6,
      fontSize: 20,
      fontFace: "Arial",
      color: TEXT_MUTED,
    });

    // Description Box
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: 3.4,
      w: 10.5,
      h: 1.4,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    slide.addText(company.description, {
      x: 1.4,
      y: 3.5,
      w: 10.1,
      h: 1.2,
      fontSize: 13,
      fontFace: "Arial",
      color: TEXT_WHITE,
      valign: "top",
    });

    // Meta Footer
    slide.addText(
      `UK Head Office: London / Harrow  •  Regional Office: Islamabad  •  ${company.website}`,
      {
        x: 1.2,
        y: 6.2,
        w: 10.5,
        h: 0.4,
        fontSize: 10,
        fontFace: "Arial",
        color: TEXT_MUTED,
      }
    );
  }

  // Generate Remaining Content Slides from profileSlides data
  profileSlides.slice(1).forEach((item, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };

    // Slide Header
    slide.addText(`${item.slideNumber}  |  ${item.category.toUpperCase()}`, {
      x: 0.8,
      y: 0.6,
      w: 10.0,
      h: 0.3,
      fontSize: 11,
      fontFace: "Arial",
      bold: true,
      color: ACCENT_BLUE,
      charSpacing: 1.5,
    });

    slide.addText(item.title, {
      x: 0.8,
      y: 0.9,
      w: 11.5,
      h: 0.7,
      fontSize: 26,
      fontFace: "Arial",
      bold: true,
      color: TEXT_WHITE,
    });

    slide.addText(item.subtitle, {
      x: 0.8,
      y: 1.6,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      fontFace: "Arial",
      color: TEXT_MUTED,
    });

    // Left Column: Main Bullet Points
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 2.2,
      w: 7.8,
      h: 4.2,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    const bulletParagraphs = item.bullets.map((bullet) => ({
      text: bullet + "\n\n",
      options: {
        fontSize: 13,
        color: TEXT_WHITE,
        fontFace: "Arial",
        bullet: { type: "number" as const, code: "25BA" },
        paraSpaceAfter: 8,
      },
    }));

    slide.addText(bulletParagraphs, {
      x: 1.1,
      y: 2.4,
      w: 7.2,
      h: 3.8,
      valign: "top",
    });

    // Right Column: Key Highlights Cards
    slide.addShape(pptx.ShapeType.rect, {
      x: 8.9,
      y: 2.2,
      w: 3.5,
      h: 4.2,
      fill: { color: CARD_BG },
      line: { color: BORDER_COLOR, width: 1 },
    });

    slide.addText("KEY SPECS & HIGHLIGHTS", {
      x: 9.1,
      y: 2.4,
      w: 3.1,
      h: 0.3,
      fontSize: 10,
      fontFace: "Arial",
      bold: true,
      color: ACCENT_CYAN,
      charSpacing: 1,
    });

    item.keyHighlights.forEach((highlight, hIdx) => {
      const cardY = 2.8 + hIdx * 0.8;

      slide.addShape(pptx.ShapeType.rect, {
        x: 9.1,
        y: cardY,
        w: 3.1,
        h: 0.7,
        fill: { color: BG_DARK },
        line: { color: BORDER_COLOR, width: 1 },
      });

      slide.addText(highlight.label.toUpperCase(), {
        x: 9.2,
        y: cardY + 0.08,
        w: 2.9,
        h: 0.2,
        fontSize: 9,
        fontFace: "Arial",
        color: TEXT_MUTED,
      });

      slide.addText(highlight.value, {
        x: 9.2,
        y: cardY + 0.28,
        w: 2.9,
        h: 0.35,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: TEXT_WHITE,
      });
    });

    // Slide Footer
    slide.addText(`${company.name}  •  ${company.website}`, {
      x: 0.8,
      y: 6.8,
      w: 6.0,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: TEXT_MUTED,
    });

    slide.addText(`Slide ${index + 2} / ${profileSlides.length}`, {
      x: 9.5,
      y: 6.8,
      w: 2.9,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      align: "right",
      color: TEXT_MUTED,
    });
  });

  // Save the PPTX file
  await pptx.writeFile({ fileName: "Tauqeer-Mustafa-Inc-Company-Profile.pptx" });
}
