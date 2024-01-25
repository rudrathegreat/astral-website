let columns_2 = 0,
    rows_2 = 0;

const wrapper_2 = document.querySelector(".apply .effect-container");
const wrapper_grid_2 = document.querySelector('.apply .effect-container .grid-effect')

const createTile_2 = index_2 => {
  const tile_2 = document.createElement("div");
  
  tile_2.classList.add("tile");
  
  tile_2.style.opacity = 0.3;
  
  return tile_2;
}

const createTiles_2 = quantity_2 => {
  Array.from(Array(quantity_2)).map((tile_2, index_2) => {
    wrapper_grid_2.appendChild(createTile_2(index_2));
  });
}

const createGrid_2 = () => {
  wrapper_grid_2.innerHTML = "";
  
  const size = wrapper_2.clientWidth > 800 ? 100 : 100;
  
  columns_2 = Math.floor(wrapper_2.clientWidth / size);
  rows_2 = Math.floor(wrapper_2.clientHeight / size);
  
  wrapper_grid_2.style.setProperty("--columns", columns_2);
  wrapper_grid_2.style.setProperty("--rows", rows_2);
  
  createTiles_2(columns_2 * rows_2);
}

createGrid_2();

window.onresize = () => createGrid_2();