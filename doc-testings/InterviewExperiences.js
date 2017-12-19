window.onload = function()
{

    path = firebase.firestore().collection("posts");
    var docIdString = "";
    path.get().then(function(querySnapshot) 
    {
            querySnapshot.forEach(function(doc) 
            { 

            docIdString = docIdString+'<div id ="ind-card" onclick=getAllContent("'+doc.id+'")>'+
            '<span id="company-name">'+doc.data().company+'</span>'+
            '<span id="user-name">'+doc.data().username+'</span>'+
            '</div>'
            });
            document.getElementById("cards").innerHTML = docIdString;
    });

};

function gotoCards()
{
    document.getElementById("cards").style.display = "block";
    document.getElementById("card-content").style.display = "none";
}

function getAllContent(docId)
{
    document.getElementById("cards").style.display = "none";
    document.getElementById("card-content").style.display = "block";
    document.getElementById("comments").innerHTML = "";
    document.getElementById("description").innerHTML = "";

    var descriptionPath = path.doc(docId);
    var commentpath = path.doc(docId).collection("comments");

    var commentString = "";

    descriptionPath.get().then(function(doc)
    {
        if(doc && doc.exists)
        {
            document.getElementById("description").innerHTML = doc.data().description;
        }
    });

    commentpath.get().then(function(querySnapshot)
    {
        querySnapshot.forEach(function(doc)
        {        
            commentString = commentString+'comment id'+doc.id+'<br>';
        }); 
    document.getElementById("comments").innerHTML = commentString;
    });
}