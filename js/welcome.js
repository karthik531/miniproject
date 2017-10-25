window.onload = function()
{
    initApp();
};

function handleSignOut()
{
    firebase.auth().signOut();
}

function displayEditor()
{
    document.getElementById("loader").style.display = "none";
    document.getElementById("editor").style.display = "block";
}

function insertEditor()
{
    document.getElementById("loader").style.display = "block";
	document.getElementById("editor").innerHTML='<object onload="displayEditor()" width="75%" height="100%" type="text/html" data="editor.html"></object>';
}

function getAllPosts()
{
	var htmlString = "";
	firebase.firestore().collection("posts").get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			console.log(doc.id, " => ", doc.data());
		});
	});
}
function getName()
{
	if(user_ref.displayName==null)
	{
		var user_name = localStorage.getItem(user_ref.email);
		if(user_name!=null)          
		{ 
			document.getElementById("und").innerHTML  = localStorage.getItem(user_ref.email);
		}
		else         
		{
			var query = firebase.firestore().collection("users").where("useremail", "==", user_ref.email);
			query.get().then(function(querySnapshot) 
			{
				if(!querySnapshot.empty)
				{
					var docRef = querySnapshot.docs[0];
					var user_name = docRef.data().username;
					localStorage.setItem(user_ref.email,user_name);
					document.getElementById("und").innerHTML = user_name;
				}
			});						
		}	 
	}
	else
	{
		localStorage.setItem(user_ref.email,user_ref.displayName);
		document.getElementById("und").innerHTML =user_ref.displayName;
	}
	document.getElementById("ued").innerHTML = user_ref.email;
}
function initApp()
{
    firebase.auth().onAuthStateChanged(function(user)
    {
        if(user)
        {
			user_ref = user;  
			getName();
		}
        else
        {
            window.location.href = "index.html";
        }
    });
}



 /* function getName(mail){
	 var cookies = document.cookie;
	 cookarg = cookies.split(';');
	 for(var i=0; i<cookarg.length-1; i+=2)
	 {
		  name = cookarg[i].split('=')[0];
		  value = cookarg[i].split('=')[1];
		  if(mail==value){
			  username = cookarg[i+1].split('=')[1];
			  return username;
		  } 
	} 
	return "";
}*/