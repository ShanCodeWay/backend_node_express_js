const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // ? OPERATIONAL ERROR
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // ? PROGRAMMING ERROR
  } else {
    console.error("ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV?.trim() === "development") {
    sendErrorDev(err, res);
  }

  sendErrorProd(err, res);
};

export default globalErrorHandler;
