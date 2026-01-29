import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export function generateFilename(agentName, timestamp, extension) {
  const sanitized = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
  const date = new Date(timestamp);
  const dateStr = date.toISOString().slice(0, 10);
  const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '');
  return `${sanitized}-${dateStr}-${timeStr}.${extension}`;
}

export function exportAsText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}

export function exportAsMarkdown(content, agentName, filename) {
  const markdown = `# ${agentName} Output\n\n${content}`;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, filename);
}

export async function exportAsDocx(content, agentName, filename) {
  const paragraphs = content.split('\n').map(line =>
    new Paragraph({
      children: [new TextRun(line || ' ')]
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `${agentName} Output`,
          heading: HeadingLevel.HEADING_1
        }),
        new Paragraph({ text: '' }),
        ...paragraphs
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
