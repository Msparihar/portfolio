# Data-Wizard App

A Python application that allows you to chat with multiple PDF documents. You can ask questions about the PDFs using natural language, and the application will provide relevant responses based on the content of the documents.

## How it works

![PDF-LangChain](https://github.com/Msparihar/Data-Wizard/assets/75237981/2df74984-d4ee-4c58-a077-73b3953c0846)

The application follows these steps to provide responses to your questions:


1. **PDF loading:** The app reads multiple PDF documents and extracts their text content.
2. **Text chunking:** The extracted text is divided into smaller chunks that can be processed effectively.
3. **Language model:** The application utilizes a language model to generate vector representations (embeddings) of the text chunks.
4. **Similarity matching:** When you ask a question, the app compares it with the text chunks and identifies the most semantically similar ones.
5. **Response generation:** The selected chunks are passed to the language model, which generates a response based on the relevant content of the PDFs.

## Dependencies and installation

To install the Data-Wizard App, please follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running the following command:
```
pip install -r requirements.txt

```
3. Obtain an API key from OpenAI and add it to the .env file in the project directory.

## Usage

To use the Data-Wizard App, follow these steps:

1. Ensure that you have installed the required dependencies and added the OpenAI API key to the .env file.
2. Run the main.py file using the Streamlit CLI. Execute the following command:
```
streamlit run app.py
```
3. The application will launch in your default web browser, displaying the user interface.
4. Load multiple PDF documents into the app by following the provided instructions.
5. Ask questions in natural language about the loaded PDFs using the chat interface.

## Contributing

We welcome contributions to the Data-Wizard App. If you have any improvements or features that you would like to add, please feel free to open a pull request.

## License

The Data-Wizard App is licensed under the Apache License 2.0.

## Contact

If you have any questions or feedback, please feel free to contact us at [manishsparihar2020@gmail.com]
