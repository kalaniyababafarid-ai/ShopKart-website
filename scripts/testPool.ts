async function check(id: string) {
  try {
    const res = await fetch(`https://images.unsplash.com/${id}?w=800&auto=format&fit=crop&q=80`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function testCategory(name: string, ids: string[]) {
  const verified: string[] = [];
  await Promise.all(ids.map(async id => {
    if (await check(id)) verified.push(id);
  }));
  console.log(`${name}: ${verified.length} / ${ids.length} verified.`);
}

async function main() {
  await testCategory('gaming', [
    'photo-1600080972464-8e5f35f63d08',
    'photo-1612287233207-640a23351d38',
    'photo-1598550476439-6847785fdd52',
    'photo-1592840496694-26d035b52b48',
    'photo-1550745165-9bc0b252726f',
    'photo-1603302576837-37561b2e2302',
    'photo-1542751371-adc38448a05e',
    'photo-1552824722-ddab137b016e',
    'photo-1593305841991-05c297ba4575',
    'photo-1538481199705-c710c4e965fc',
    'photo-1580234811497-9df7fd2f357e',
    'photo-1511512578047-dfb367046420',
    'photo-1579373903781-fd5c0c30c4cd',
    'photo-1509198397868-475647b2a1e5',
    'photo-1546410531-bb4caa6b424d',
    'photo-1526509867162-5b0c0d1b4b33',
    'photo-1551103782-8ab07afd45c1',
    'photo-1563089145-599997674d42',
    'photo-1589241062272-c0a000072dfa',
    'photo-1593118247619-e2d6f056869e',
    'photo-1607604276583-eef5d076aa5f',
    'photo-1614680376593-902f749f7ffc',
    'photo-1534423861386-85a16f5d13fd',
    'photo-1586182987320-4f376899f750',
    'photo-1592478411213-6153e4ebc07d',
  ]);
}
main();
