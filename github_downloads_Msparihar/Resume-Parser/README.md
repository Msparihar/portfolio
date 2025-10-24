# Resume Parser

This application uses Streamlit and ChatGPT to parse resumes and convert them into JSON format.

# Demo

https://github.com/Msparihar/Resume-Parser/assets/75237981/2c463bbb-b350-4342-8c0e-4c43fd4ff415

## Setup

1. Clone the repository

```bash
git clone https://github.com/Msparihar/Resume-Parser.git
```

2. Install the required packages:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the Streamlit app:

```bash
streamlit run app.py
```

## Usage

1. Upload a resume file (PDF, DOCX, or TXT format)
2. Click on "Parse Resume"
3. The parsed JSON output will be displayed

## Note

This application uses the OpenAI API, which may incur costs. Please be aware of your usage and any associated fees.
