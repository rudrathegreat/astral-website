const wrapper = document.querySelector(".why .effect-container");
const wrapper_grid = document.querySelector('.why .effect-container .grid-effect')

let columns = 0,
    rows = 0;

const createTile = index => {
  const tile = document.createElement("div");
  
  tile.classList.add("tile");
  
  tile.style.opacity = 0.3;
  
  return tile;
}

const createTiles = quantity => {
  Array.from(Array(quantity)).map((tile, index) => {
    wrapper_grid.appendChild(createTile(index));
  });
}

const createGrid = () => {
  wrapper_grid.innerHTML = "";
  
  const size = wrapper.clientWidth > 800 ? 100 : 100;
  
  columns = Math.floor(wrapper.clientWidth / size);
  rows = Math.floor(wrapper.clientHeight / size);
  
  wrapper_grid.style.setProperty("--columns", columns);
  wrapper_grid.style.setProperty("--rows", rows);
  
  createTiles(columns * rows);
}

createGrid();

window.onresize = () => createGrid();