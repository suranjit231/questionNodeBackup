import React, { useState, useEffect } from 'react';
import styles from '../questionCs/Question.module.css';
import { IoClose } from "react-icons/io5";

import NextStepModel from '../../../utility/nextStepsModel/NextStepModel';



const defaultQuestion = {
    text: '',
    options: []
};

const defaultRouting = {
    routingMap: {},
    default: null
};

const QuestionForm = ({ 
    question = defaultQuestion,
    routing = defaultRouting,
    onQuestionChange,
    onOptionsChange,
    onRoutingMapChange,
    onDefaultRouteChange,
    onQuestionUpdate,
    onUpdateOption,
    onSelectNextRoute
}) => {
    const [localOptions, setLocalOptions] = useState(question.options || []);
    const [localText, setLocalText] = useState(question.text || '');

    useEffect(() => {
        setLocalOptions(question.options || []);
        setLocalText(question.text || '');
    }, [question.options, question.text]);

    const handleQuestionTextChange = (e) => {
        setLocalText(e.target.value);
    };

    const handleQuestionTextBlur = () => {
        if (localText !== question.text) {
            onQuestionUpdate?.({
                ...question,
                text: localText
            });
        }
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...localOptions];
        if (field === 'synonyms') {
            updatedOptions[index] = {
                ...updatedOptions[index],
                _tempSynonyms: value
            };
        } else {
            updatedOptions[index] = {
                ...updatedOptions[index],
                [field]: value
            };
        }
        setLocalOptions(updatedOptions);
    };

    const handleSynonymsBlur = (index) => {
        const option = localOptions[index];
        const rawSynonyms = option._tempSynonyms || option.synonyms?.join(', ') || '';
        const updateData = {
            ...option,
            synonyms: rawSynonyms.split(',').map(s => s.trim()).filter(Boolean)
        };
        delete updateData._tempSynonyms;
        onUpdateOption?.(option._id, updateData);
    };

    const handleInputBlur = (index, field, value) => {
        const option = localOptions[index];
        const updateData = {
            ...option,
            [field]: value
        };
        onUpdateOption?.(option._id, updateData);
    };

    return (
        <div className={styles.questionForm}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Question Text</label>
                <input
                    type="text"
                    value={localText}
                    onChange={handleQuestionTextChange}
                    onBlur={handleQuestionTextBlur}
                    className={styles.input}
                    placeholder="Enter your question"
                />
            </div>

            <div className={styles.optionsListSection}>
                {localOptions.map((option, index) => (
                    <div key={index} className={styles.optionsSection}>
                        <IoClose className={styles.optionsDeleteIcon} />
                        <input 
                            type="text" 
                            className={styles.displayName} 
                            placeholder='Display Name...'
                            value={option.label || ''}
                            onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                            onBlur={(e) => handleInputBlur(index, 'label', e.target.value)}
                        />

                        <input 
                            type="text" 
                            className={styles.valueOption} 
                            placeholder='Value...'
                            value={option.value || ''}
                            onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                            onBlur={(e) => handleInputBlur(index, 'value', e.target.value)}
                        />

                        <textarea 
                            className={styles.input} 
                            placeholder="Synonyms (comma-separated)" 
                            rows={3}
                            value={option._tempSynonyms || option.synonyms?.join(', ') || ''}
                            onChange={(e) => handleOptionChange(index, 'synonyms', e.target.value)}
                            onBlur={() => handleSynonymsBlur(index)}
                        />
                        <button 
                            className={styles.selectNextButton}
                            onClick={(e) => onSelectNextRoute?.(option._id, e)}
                        >
                            Select Next Route
                        </button>
                        <div className={styles.routeButtonDiv}>
                            {routing.routingMap?.[option.value] || 'Select Next Route'}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default QuestionForm;












































// import React, { useState, useEffect } from 'react';
// import styles from '../questionCs/Question.module.css';
// import { IoClose } from "react-icons/io5";

// import NextStepModel from '../../../utility/nextStepsModel/NextStepModel';



// const defaultQuestion = {
//     text: '',
//     options: []
// };

// const defaultRouting = {
//     routingMap: {},
//     default: null
// };

// const QuestionForm = ({ 
//     question = defaultQuestion,
//     routing = defaultRouting,
//     onQuestionTextChange,
//     onOptionsChange,
//     onRoutingMapChange,
//     onDefaultRouteChange,
//     onQuestionUpdate,
//     onUpdateOption,
//     onSelectNextRoute
// }) => {
//     const [localOptions, setLocalOptions] = useState(question.options || []);

//     useEffect(() => {
//         setLocalOptions(question.options || []);
//     }, [question.options]);

//     const handleQuestionTextChange = (e) => {
//         onQuestionTextChange?.(e.target.value);
//     };

//     const handleQuestionTextBlur = (e) => {
//         onQuestionUpdate?.({
//             ...question,
//             text: e.target.value
//         });
//     };

//     const handleOptionChange = (index, field, value) => {
//         const updatedOptions = [...localOptions];
//         if (field === 'synonyms') {
//             updatedOptions[index] = {
//                 ...updatedOptions[index],
//                 _tempSynonyms: value
//             };
//         } else {
//             updatedOptions[index] = {
//                 ...updatedOptions[index],
//                 [field]: value
//             };
//         }
//         setLocalOptions(updatedOptions);
//     };

//     const handleSynonymsBlur = (index) => {
//         const option = localOptions[index];
//         const rawSynonyms = option._tempSynonyms || option.synonyms?.join(', ') || '';
//         const updateData = {
//             ...option,
//             synonyms: rawSynonyms.split(',').map(s => s.trim()).filter(Boolean)
//         };
//         delete updateData._tempSynonyms;
//         onUpdateOption?.(option._id, updateData);
//     };

//     const handleInputBlur = (index, field, value) => {
//         const option = localOptions[index];
//         const updateData = {
//             ...option,
//             [field]: value
//         };
//         onUpdateOption?.(option._id, updateData);
//     };

//     return (
//         <div className={styles.questionForm}>
//             <div className={styles.formGroup}>
//                 <label className={styles.label}>Question Text</label>
//                 <input
//                     type="text"
//                     value={question.text || ''}
//                     onChange={handleQuestionTextChange}
//                     onBlur={handleQuestionTextBlur}
//                     className={styles.input}
//                     placeholder="Enter your question"
//                 />
//             </div>

//             <div className={styles.optionsListSection}>
//                 {localOptions.map((option, index) => (
//                     <div key={index} className={styles.optionsSection}>
//                         <IoClose className={styles.optionsDeleteIcon} />
//                         <input 
//                             type="text" 
//                             className={styles.displayName} 
//                             placeholder='Display Name...'
//                             value={option.label || ''}
//                             onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
//                             onBlur={(e) => handleInputBlur(index, 'label', e.target.value)}
//                         />

//                         <input 
//                             type="text" 
//                             className={styles.valueOption} 
//                             placeholder='Value...'
//                             value={option.value || ''}
//                             onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
//                             onBlur={(e) => handleInputBlur(index, 'value', e.target.value)}
//                         />

//                         <textarea 
//                             className={styles.input} 
//                             placeholder="Synonyms (comma-separated)" 
//                             rows={3}
//                             value={option._tempSynonyms || option.synonyms?.join(', ') || ''}
//                             onChange={(e) => handleOptionChange(index, 'synonyms', e.target.value)}
//                             onBlur={() => handleSynonymsBlur(index)}
//                         />
//                         <button 
//                             className={styles.selectNextButton}
//                             onClick={(e) => onSelectNextRoute?.(option._id, e)}
//                         >
//                             Select Next Route
//                         </button>
//                         <div className={styles.routeButtonDiv}>
//                             {routing.routingMap?.[option.value] || 'Select Next Route'}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//         </div>
//     );
// };

// export default QuestionForm;
