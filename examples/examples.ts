type ExampleEntry = {
  name: string;
  title: string;
  descrption: string;
};

const examples: ExampleEntry[] = [
  {
    name: 'triangle',
    title: 'Triangle',
    descrption: 'A simple triangle',
  },
];

function addExamples() {
  const sortedExamples = examples.sort((a, b) => a.name.localeCompare(b.name));
  const examplesList = document.getElementById('examples-list');

  sortedExamples.forEach(example => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `./${example.name}/${example.name}.html`;
    link.textContent = `${example.title} - ${example.descrption}`;
    listItem.appendChild(link);
    examplesList?.appendChild(listItem);
  });
}

addExamples();
