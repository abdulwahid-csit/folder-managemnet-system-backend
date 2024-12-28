// logger.js

const logRequest = (req, res, next) => {
  const currentTime = new Date().toISOString();
  const method = req.method; 
  const route = req.originalUrl; 
  const ip = req.ip; 

  console.log(`[${currentTime}] ${method} request to ${route} from ${ip}`);
    if(req.method == 'POST'){
        console.log('Body In Logger: ', req.body);
    }
  next();
};

module.exports = logRequest;
