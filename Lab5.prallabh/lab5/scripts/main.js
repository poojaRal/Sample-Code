var CheckUser = function(userName){
$.get("http://localhost:8008/user/" + userName, { name:"Donald", town:"Ducktown" }, function(data){
	alert(data);
});
};


$( ".btnCheckUser" ).click(function() {
  alert( "Handler for .click() called." );
});

function func(){
	alert('y');
};