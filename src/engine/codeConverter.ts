import { CodeBlock } from '../types/game';

// Mengonversi daftar block visual menjadi kode JavaScript yang valid & rapi
export function blocksToJavaScript(blocks: CodeBlock[], indent: string = ''): string {
  if (!blocks || blocks.length === 0) return '';
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'FORWARD':
        lines.push(`${indent}moveForward();`);
        break;
      case 'TURN_LEFT':
        lines.push(`${indent}turnLeft();`);
        break;
      case 'TURN_RIGHT':
        lines.push(`${indent}turnRight();`);
        break;
      case 'REPEAT': {
        const count = block.repeatCount || 2;
        lines.push(`${indent}repeat(${count}, () => {`);
        if (block.children && block.children.length > 0) {
          lines.push(blocksToJavaScript(block.children, indent + '  '));
        }
        lines.push(`${indent}});`);
        break;
      }
      case 'IF_PATH_CLEAR': {
        lines.push(`${indent}ifPathAhead(() => {`);
        if (block.children && block.children.length > 0) {
          lines.push(blocksToJavaScript(block.children, indent + '  '));
        }
        lines.push(`${indent}});`);
        break;
      }
      default:
        break;
    }
  }

  return lines.join('\n');
}

// Mengonversi kode JavaScript sederhana menjadi susunan balok visual (dua arah)
export function javaScriptToBlocks(code: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('moveForward(')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'FORWARD',
      });
      i++;
    } else if (line.startsWith('moveRight(')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'FORWARD', // Direpresentasikan sebagai aksi gerak
      });
      i++;
    } else if (line.startsWith('moveDown(') || line.startsWith('moveLeft(') || line.startsWith('moveUp(')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'FORWARD',
      });
      i++;
    } else if (line.startsWith('turnLeft(')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'TURN_LEFT',
      });
      i++;
    } else if (line.startsWith('turnRight(')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'TURN_RIGHT',
      });
      i++;
    } else if (line.startsWith('repeat(')) {
      // Ekstrak count repeat(3, () => {
      const match = line.match(/repeat\((\d+)/);
      const count = match ? parseInt(match[1], 10) : 2;
      i++;
      // Kumpulkan baris anak sampai penutup });
      const childLines: string[] = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        if (lines[i].includes('{')) depth++;
        if (lines[i].includes('}')) depth--;
        if (depth > 0) {
          childLines.push(lines[i]);
        }
        i++;
      }
      const children = javaScriptToBlocks(childLines.join('\n'));
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'REPEAT',
        repeatCount: count,
        children,
      });
    } else if (line.startsWith('ifPathAhead(')) {
      i++;
      const childLines: string[] = [];
      let depth = 1;
      while (i < lines.length && depth > 0) {
        if (lines[i].includes('{')) depth++;
        if (lines[i].includes('}')) depth--;
        if (depth > 0) {
          childLines.push(lines[i]);
        }
        i++;
      }
      const children = javaScriptToBlocks(childLines.join('\n'));
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'IF_PATH_CLEAR',
        children,
      });
    } else {
      // Baris kode JavaScript lainnya (variabel, fungsi manual, loop for standar)
      i++;
    }
  }

  return blocks;
}
