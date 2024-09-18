import { CSSData, getCssDataForTagNew } from './getCssDataForTag';
import { isImageNode } from './isImageNode';
export type UnitType = 'px' | 'rem' | 'remAs10px';

type Component = {
  name: string;
  props: { [property: string]: string | boolean } | null;
  isComponent: true;
  children: Tag[];
};

export type ChunkComponet = {
  nodeId: string;
  isChunk: boolean;
};

export type Tag =
  | {
      id?: string;
      name: string;
      isText?: boolean;
      textCharacters?: string | null;
      isImg?: boolean;
      css: CSSData;
      children: Tag[];
      isComponent?: false;
      tokens?: { [key in string]: string };
    }
  | Component
  | ChunkComponet;

export type ComponentType = {};

export const buildTagTree = async(
  node: SceneNode,
  componentNodes: ComponentNode[]
): Promise<Tag | null> => {
  if (!node.visible) {
    return null;
  }

  const isImg = isImageNode(node);

  const childTags: Tag[] = [];
  if ('children' in node && !isImg) {
    node.children.forEach(async (child) => {
      const childTag = await buildTagTree(child, componentNodes);
      if (childTag) {
        childTags.push(childTag);
      }
    });
  }

  const tag: Tag = {
    id: node.id,
    name: node.name,
    css: await getCssDataForTagNew(node),
    children: childTags,
  };

  if (node.type === 'TEXT') {
    tag.isText = true;
    tag.textCharacters = node.characters;
  }
  if (isImg) {
    tag.isImg = true;
  }

  return tag;
}
