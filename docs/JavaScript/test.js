const treeData = [
  {
    title: '0-0',
    id: '0-0',
    children: [
      {
        title: '0-0-0',
        id: '0-0-0',
        parentId: '0-0',
        children: [
          { title: '0-0-0-0', id: '0-0-0-0', parentId: '0-0-0' },
          { title: '0-0-0-1', id: '0-0-0-1', parentId: '0-0-0' },
          { title: '0-0-0-2', id: '0-0-0-2', parentId: '0-0-0' },
        ],
      },
      {
        title: '0-0-1',
        id: '0-0-1',
        parentId: '0-0',
        children: [
          { title: '0-0-1-0', id: '0-0-1-0', parentId: '0-0-1' },
          { title: '0-0-1-1', id: '0-0-1-1', parentId: '0-0-1' },
          { title: '0-0-1-2', id: '0-0-1-2', parentId: '0-0-1' },
        ],
      },
      {
        title: '0-0-2',
        id: '0-0-2',
        parentId: '0-0',
      },
    ],
  },
  {
    title: '0-1',
    id: '0-1',
    children: [
      { title: '0-1-0-0',id: '0-1-0-0', parentId: '0-1' },
      { title: '0-1-0-1', id: '0-1-0-1', parentId: '0-1' },
      { title: '0-1-0-2', id: '0-1-0-2', parentId: '0-1' },
    ],
  },
  {
    title: '0-2',
    id: '0-2',
  },
];

const treeToList = (tree, list = []) => {
  tree.forEach((node) => {
    list.push(node);
    node.children && treeToList(node.children, list);
  });
  return list;
};

const list = treeToList(treeData);

console.log('treeToList', list);

const listToTree = (list) => {
  const treeMap = list.reduce(
    (map, node) => {
      map[node.id] = node;
      node.children = [];
      return map;
    },
    {}
  );
  // console.log(treeMap)
  return list.filter((node) => {
    if (treeMap[node.parentId]) treeMap[node.parentId].children.push(node);
    // treeMap[node.parentId] && treeMap[node.parentId].children.push(node);
    // 返回根节点
    return !node.parentId;
  });
};

const tree = listToTree(list);

console.log('listToTree', tree)