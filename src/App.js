
import React from 'react';
import GridSquare from './components/GridSquare';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: 0,
      cols: 0,
      gridComp: [],
      gridUnion: [],
    }

    this.handleChangeCols = this.handleChangeCols.bind(this);
    this.handleChangeRows = this.handleChangeRows.bind(this);
    this.createGrid = this.createGrid.bind(this);
    this.refreshGrid = this.refreshGrid.bind(this);
    this.root = this.root.bind(this);
    this.union = this.union.bind(this);

  }

  handleChangeCols(event) {
    this.setState({ cols: parseInt(event.target.value.replace(/\+|-/ig, '')) });
  }

  handleChangeRows(event) {
    this.setState({ rows: parseInt(event.target.value.replace(/\+|-/ig, '')) });
  }

  createGrid() {

    let gridComp = [];
    let gridUnion = [];

    for (let row = 0; row <= this.state.rows; row++) {

      if (row === 0) {
        //Virtual top site
        gridUnion.push([{ rootRow: 0, rootCol: 0, color: 1, size: 0 }]);
        gridComp.push([]);
      } else {
        gridComp.push([]);
        gridUnion.push([]);
        for (let col = 0; col < this.state.cols; col++) {
          gridUnion[row].push({ rootRow: row, rootCol: col, color: 0, size: 0 });
          gridComp[row].push(
            <GridSquare
              key={`${row}${col}`}
              color={gridUnion[row][col].color}
              row={row}
              col={col}
              rootRow={row}
              rootCol={col}
              onClick={this.ocSquare}
            />);
        }
      }
    }

    //Virtual bottom site
    gridUnion.push([]);
    gridUnion[this.state.rows + 1].push({ rootRow: this.state.rows + 1, rootCol: 0, color: 1, size: 0 });

    this.setState({ gridComp: gridComp, gridUnion: gridUnion });

  }

  refreshGrid(gridUnion) {

    let gridComp = [];
    let length = gridUnion.length - 1.

    gridComp.push([]);
    for (let row = 1; row < length; row++) {
      gridComp.push([]);
      for (let col = 0; col < gridUnion[row].length; col++) {
        gridComp[row].push(
          <GridSquare
            key={`${row}${col}`}
            color={gridUnion[row][col].color}
            row={row}
            col={col}
            rootRow={gridUnion[row][col].rootRow}
            rootCol={gridUnion[row][col].rootCol}
            onClick={this.ocSquare}
          />);
      }
    }

    this.setState({ gridComp: gridComp, gridUnion: gridUnion });

  }

  //Open new site
  ocSquare = (row, col) => {

    //Get current state of the grid
    let gridUnion = this.state.gridUnion;

    //Validate if the site is closed
    if (gridUnion[row][col].color === 0) {

      //Get coordinates from surrounding sites
      let topRow = row - 1;
      let bottomRow = row + 1;
      let leftCol = col - 1;
      let rightCol = col + 1;


      if (row > 1) {
        //Connect with site above
        let top = gridUnion[topRow][col];
        top.color === 1 && this.union(gridUnion, { row, col }, { row: topRow, col });

      } else if (row === 1) {
        //Connect with virtual top site
        this.union(gridUnion, { row, col }, { row: 0, col: 0 });

      }

      if (row < this.state.rows) {
        //Connect with site below
        let bottom = gridUnion[bottomRow][col];
        bottom.color === 1 && this.union(gridUnion, { row, col }, { row: bottomRow, col });

      } else if (row === this.state.rows) {
        //Connect with virtual bottom site
        this.union(gridUnion, { row, col }, { row: this.state.rows + 1, col: 0 });

      }

      if (col > 0) {
        //Connect with left site
        let left = gridUnion[row][leftCol];
        left.color === 1 && this.union(gridUnion, { row, col }, { row, col: leftCol });

      }

      if (col < this.state.cols - 1) {
        //Connect with right site
        let right = gridUnion[row][rightCol];
        right.color === 1 && this.union(gridUnion, { row, col }, { row, col: rightCol });

      }

      gridUnion[row][col].color = 1;
      //Update grid state
      this.refreshGrid(gridUnion);

    }

  }

  root(square) {

    const { gridUnion } = this.state;

    let row = square.rootRow;
    let col = square.rootCol;

    while (row !== gridUnion[row][col].rootRow && col !== gridUnion[row][col].rootCol) {

      let prevRow = row;
      let prevCol = col;

      row = gridUnion[prevRow][prevCol].rootRow;
      col = gridUnion[prevRow][prevCol].rootCol;

      // console.log(
      //   'From: ' + row + col +
      //   'To: ' + gridUnion[row][col].rootRow + gridUnion[row][col].rootCol
      // );
    }
    return { row, col };
  }

  topBottomConnected() {
    return this.connected(this.state.gridUnion, { row: 0, col: 0 }, { row: this.state.rows + 1, col: 0 })
  }

  connected(gridUnion, a, b) {

    let rootA = this.root(gridUnion[a.row][a.col]);
    let rootB = this.root(gridUnion[b.row][b.col]);

    console.log(rootA.row + rootA.col + ' - ' + rootB.row + rootB.col);
    console.log(rootA.col === rootB.col && rootA.row === rootB.row ? true : false);

    return rootA.col === rootB.col && rootA.row === rootB.row ? true : false;

  }

  union(gridUnion, a, b) {

    let rootA = this.root(gridUnion[a.row][a.col]);
    let rootB = this.root(gridUnion[b.row][b.col]);

    let rowA = rootA.row;
    let rowB = rootB.row;
    let colA = rootA.col;
    let colB = rootB.col;

    if (rowA !== rowB || colA !== colB) {

      if (gridUnion[rowA][colA].size > gridUnion[rowB][colB].size) {

        gridUnion[rowB][colB].rootRow = rootA.row;
        gridUnion[rowB][colB].rootCol = rootA.col;
        ++gridUnion[rowA][colA].size
        gridUnion[rowA][colA].size += gridUnion[rowB][colB].size;

      } else {

        gridUnion[rowA][colA].rootRow = rootB.row;
        gridUnion[rowA][colA].rootCol = rootB.col;

        if (gridUnion[rowA][colA].size === 0) {

          ++gridUnion[rowB][colB].size

        } else {

          ++gridUnion[rowB][colB].size
          gridUnion[rowB][colB].size += gridUnion[rowA][colA].size;
        }

      }
    }

    // console.log('A:' + rootA.row + rootA.col +
    //   ' Size:' + gridUnion[rootA.row][rootA.col].size +
    //   ' Root:' + gridUnion[rootA.row][rootA.col].rootRow + gridUnion[rootA.row][rootA.col].rootCol)
    // console.log('B:' + rootB.row + rootB.col +
    //   ' Size:' + gridUnion[rootB.row][rootB.col].size +
    //   ' Root:' + gridUnion[rootB.row][rootB.col].rootRow + gridUnion[rootB.row][rootB.col].rootCol)

  }


  render() {

    const { gridComp } = this.state;

    return (

      gridComp.length === 0 ?
        <div className="App" style={{width: '40rem'}}>
          <h1>Percolation</h1>
          <p>
            Given a composite systems comprised of randomly distributed insulating and metallic materials:
          what fraction of the materials need to be metallic so that the composite system is an electrical
          conductor? Given a porous landscape with water on the surface (or oil below), under what conditions
          will the water be able to drain through to the bottom (or the oil to gush through to the surface)?
              Scientists have defined an abstract process known as percolation to model such situations</p>
          <form onSubmit={this.handleSubmit}>
            <label>
              Number of columns:
          <input type="text" id='x' value={this.state.cols} onChange={this.handleChangeCols} />
            </label>
            <label>
              Number of rows:
          <input type="text" id='y' value={this.state.rows} onChange={this.handleChangeRows} />
            </label>
            <input type="submit" value="Submit" onClick={this.createGrid} />
          </form>
        </div>

        :

        <div className="App">
          <div className='grid-board' style={{ gridTemplateColumns: `repeat(${this.state.cols},30px)` }}>
            {gridComp}
          </div>
          {
            this.topBottomConnected() ? <h1>Percolates</h1> : <h1>Does not percolates</h1>
          }
        </div>

    )
  }
}

export default App;

