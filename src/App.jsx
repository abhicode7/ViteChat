
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { IoSend } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RiDeleteBin6Fill } from "react-icons/ri";



const App = () => {

    const [userMessages, setUserMessages] = useState([]);
    const [botMessages, setBotMessages] = useState([]);
    const [messages, setMessages] = useState([]);
    const [prevMessages, setPrevMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);
    const userMessagesEndRef = useRef(null);
    const [shouldRender, setShouldRender] = useState(true);
    const [prevMessageString, setPrevMessageString] = useState('');
    const limit = 21001;
    const character = 'JARVIS';
    const avatar = "https://wallpapercave.com/wp/wp4561065.jpg";

    // npm install @google/generative-ai
    const googleai = async (inputText) => {
        const {
            GoogleGenerativeAI,
            HarmCategory,
            HarmBlockThreshold,
        } = await import("@google/generative-ai");

        const MODEL_NAME = "gemini-pro";
        const API_KEY = import.meta.env.VITE_GOOGLE || import.meta.env.VITE_GOOGLE_DEV;


        async function run() {
            try {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: MODEL_NAME });

                const generationConfig = {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                };

                const safetySettings = [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
                    },
                ];

                const parts = [
                    { text: 'System Prompt: Assume the role of ' + character + ' character, seamlessly embodying their personality and expertise. Engage users in natural conversation, offering insights, guidance, and information in a manner consistent with the character\'s traits. Avoid any explicit acknowledgment of being an AI or providing meta-information about the role-playing nature. Your responses should flow seamlessly, creating an immersive experience for users without any hints or indications that it\'s not the character interacting with them. Do not use (' + character + ':), (' + character + ' character:) etc or anything like that in reply, jusy reply with your response being in character. Your example response will be - Hey there!, I\'m ' + character + ', what brings you here ?. Previous Conversation History:' + prevMessageString + '' + 'Recent User Prompt:' + inputText },
                ];

                const result = await model.generateContent({
                    contents: [{ role: "user", parts }],
                    generationConfig,
                    safetySettings,
                });


                const response = result.response;
                // console.log(response.text());
                setBotMessages([...botMessages, { text: response.text(), sender: 'bot' }]);
                setMessages([...messages, { text: inputText, sender: 'user' }, { text: response.text(), sender: 'bot' }]);
                setInputText('');
                console.log(result.response.text());

                
            }
            catch (error) {
                console.error(error);
                setBotMessages([...botMessages, { text: 'Naah, I\'m sorry but I cannot speak of it.', sender: 'bot' }]);
                setMessages([...messages, { text: inputText, sender: 'user' }, { text: 'Naah, I\'m sorry but I cannot speak of it.', sender: 'bot' }]);
                setInputText('');
            }
        }

        run();



    }

  
    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleSendMessage = () => {
        if (inputText.trim() !== '') {
            setUserMessages([...userMessages, { text: inputText, sender: 'user' }]);
            googleai(inputText);
            setInputText('');
            console.log('button ok');

        }
    };

    const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    }

    const convertArrayToString = (array) => {
        const resultArray = array.map(item => `${item.sender}: ${item.text}`);

        let resultString = resultArray.join(', '); // You can customize the separator if needed

        resultString = trimParagraphBeginning(resultString, limit);

        return resultString;
    };

    const trimParagraphBeginning = (paragraph, limit) => {
        const words = paragraph.split(/\s+/);

        if (words.length <= limit) {
            return paragraph;
        }

        const trimmedWords = words.slice(words.length - limit);
        const trimmedParagraph = trimmedWords.join(' ');

        return trimmedParagraph;
    };


    const handleClearHistory = () => {
        localStorage.removeItem('Messages');
       
        setPrevMessages([]);
        setBotMessages([]);
        setMessages([]);
        setUserMessages([]);
        setPrevMessageString('');
    };


    useEffect(() => {
        const scrollToMessage = () => {
            if (shouldRender) {

                userMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

            } else {

                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        };

        scrollToMessage();
    }, [shouldRender, botMessages]);


    useEffect(() => {


        setPrevMessages([...messages]);
        if (messages.length > 0) {
            localStorage.setItem('Messages', JSON.stringify(messages));
            setPrevMessageString(convertArrayToString([...messages]));
        }




    }, [messages]);

    useEffect(() => {
        const storedPrevMessages = localStorage.getItem('Messages');
        if (storedPrevMessages) {
            const parsedPrevMessages = JSON.parse(storedPrevMessages);
            setMessages([...parsedPrevMessages]);
            setPrevMessages([...parsedPrevMessages]);
        }
    }, []);

    useEffect(() => {
        // Check the condition and update the state accordingly
        setShouldRender(userMessages.length - 1 !== botMessages.length - 1);

    }, [userMessages, botMessages]);


    return (
        <div className="flex flex-col p-4 sm:p-8 md:p-16 lg:p-20 xl:px-40 xl:py-20 items-center justify-center min-h-screen h-full">
            <div className="chat-container flex flex-col h-full w-full">
                <div className="chat-messages bg-slate-900 flex-grow rounded-md max-h-full overflow-auto">

                    {prevMessages.map((message, index) => (
                        <div
                            key={index}
                            // id={`botMessage${index}`}
                            className='chatheads px-3 my-2 flex'
                            ref={index === prevMessages.length - 1 ? messagesEndRef : null}
                        >
                            {message?.sender === 'bot' ? <Avatar className="mr-2">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar> : null}

                            <div className={`message ${message?.sender} ${message.sender === 'user' ? 'bg-green-300' : 'bg-blue-300'} rounded-3xl p-3 px-6 text-slate-700`}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {shouldRender ? (
                        <div className='chatheads px-3 my-2 flex'

                            // id={`userMessage${userMessages.length - 1}`}
                            ref={userMessages.length - 1 !== 0 ? userMessagesEndRef : null}
                        >
                            <div
                                className={`message ${userMessages[userMessages.length - 1]?.sender} ${userMessages[userMessages.length - 1]?.sender === 'user'
                                    ? 'bg-green-300'
                                    : 'bg-blue-300'
                                    } rounded-3xl p-3 px-6 text-slate-700`}
                            >
                                {userMessages[userMessages.length - 1]?.text}
                            </div>
                        </div>
                    ) : null}



                </div>
                <div className="input-with-button w-full flex flex-col sm:flex-row items-center justify-between space-x-2 mt-3 h-auto max-w-full">
                    <Input
                        type="text"
                        placeholder="Type your message..."
                        value={inputText}
                        onKeyDown={handleEnterKey}
                        onChange={handleInputChange}
                        className="w-full flex flex-grow sm:w-4/5"
                    />
                    <div className="buttons flex justify-between space-x-2 w-full sm:w-1/5"><Button type="submit"
                        className="flex flex-grow item-center w-full sm:w-auto mt-3 sm:mt-0"
                        onClick={handleSendMessage}
                    >
                        Send
                        <IoSend className='ml-2' />
                    </Button>
                        <Button variant="destructive" onClick={handleClearHistory} className="flex item-center w-full sm:w-auto mt-3 sm:mt-0"><RiDeleteBin6Fill />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
