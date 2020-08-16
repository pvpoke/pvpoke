// JavaScript Document

function Main() {
  let myInterface;
  let gm;

  init();

  function init() {
    const gm = GameMaster.getInstance();
  }

  this.getGM = function () {
    return gm;
  };
}

const main = new Main();
