$(document).ready(function(){
    $("#get-data-form").submit(function(e){
        var content = tinymce.get("texteditor").getContent();
        var titleID = document.getElementById("titleID").value.toUpperCase;
        var companyID = document.getElementById("companyID").value.toUpperCase;
        
        var cookies = document.cookie;
        cookarg = cookies.split(';');
        mail = cookarg[0].split('=')[1];
        name = cookarg[1].split('=')[1];
              
        var d = new Date();
        var ts = d.getTime();
        document.getElementById("data-container").innerHTML = content;
        /*var experience = {
            timestamp: ts,
            username: name,
            email: emailID
            title: titleID,
         */
        //document.getElementById("data-container").innerHTML = experience;
        return false;
    });
});