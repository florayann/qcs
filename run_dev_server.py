from qcs import app
import os

if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 3001)), threaded=True)
