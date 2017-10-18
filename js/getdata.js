function insertPost()
{
		firebase.auth().onAuthStateChanged(function(user)
		{
			if(user)
			{
				user_ref = user;
				continueInsertPost();
			}
			else
			{
				window.location.href = 'index.html';
			}
		});
}
function continueInsertPost()
{
	var user_mail = user_ref.email;
	var user_name = localStorage.getItem(user_ref.email);
	var title_name = document.getElementById("titleID").value.toUpperCase();
	var company_name= document.getElementById("companyID").value.toUpperCase();
	var content =  tinymce.get("texteditor").getContent()
	var d = new Date();
	var time_stamp = d.getTime();
	var experience = {
		timestamp: time_stamp,
		useremail: user_mail,
		username: user_name,
		company: company_name,
		title: title_name,
		description: content
	};
	var postRef = firebase.firestore().collection("posts").doc();
	var colRef = firebase.firestore().collection("company");
	colRef.where("name", "==", company_name).get().then(function(querySnapshot) 
	{
		if(querySnapshot.empty)
		{
			DocRef = colRef.add({
			name: company_name,
			count: 1
			});
		}
		else
		{
			var DocRef = querySnapshot.docs[0];
			var doc_id = DocRef.id;
			var md_ct = DocRef.data().count+1;
			
			colRef.doc(doc_id).update({
			count: md_ct
			});
		}
	});
	postRef.set(experience).then(function(){
		console.log("Document successfully written!");
	}).catch(function(error) {
	console.error("Error writing document: ", error);
	}); 
}