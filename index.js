const { Firestore } = require('@google-cloud/firestore');

let firestore;
function getdb() {
	if (!firestore) {
		firestore = new Firestore();
	}
	return firestore;
}

exports.helloServerless = async (req, res) => {
	try {
		// save a log entry in firestore databas

	   const db = getdb();
	   const user = (req.query.user || '').trim();
           if  (!user) {
		   console.warn(JSON.stringify({
			   event: 'VALIDATION_FAILED',
			   reason: 'Missing user parameter'}));
		   return res.status(400).json({
			   status: 'error' ,
			   message: 'Query parameter USER is required'
		   });
	   }

           const docRef = firestore.collection('requests').doc();
	   await docRef.set({
		   user,
		   timestamp: new Date().toISOString(),
		   message: 'Hello from Serverless GCP Function!'
	   });
           
	   console.log(JSON.stringify({
		   event: 'REQUEST_SAVED',
		   user,
		   savedID: docRef.id }));
           res.status(200).send({
		   status: 'success',
		   user,
		   message: 'Serverless API executed and data saved to Firestore!',
		   savedId: docRef.id
	   });
	  } catch (error) {
		  console.error(JSON.stringify({
			  event: 'FIRESTORE_ERROR',
			  error: error.message
		  }));
		  res.status(500).json({ 
			  status: 'Error', 
			  error: error.message });
	  }
};
		  
		
