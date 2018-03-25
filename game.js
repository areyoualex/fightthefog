var app;

$(()=>{
  //When sign in button is clicked
  $("#signin > button").bind("click", function(){
    //If text is blank, tell user to fill it out
    if($("#signin > input:eq(0)").val() == "") { alert("Please enter a name."); }
    else {
      //Hide sign-in form
      $("#signin").hide();
      createGame();
    }
  });
})

//Called after signin
function createGame(){
  //Create application
  app = new PIXI.Application({
    "width":640,
    "height":480
  });

  //Add child to DOM
  document.body.appendChild(app.view);

  //TODO connect to server and make a socket
}

//Will handle all loading
function load(){

}
