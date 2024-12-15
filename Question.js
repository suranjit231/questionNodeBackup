import React, { useState, useEffect } from 'react';
import styles from '../questionCs/Question.module.css';
import QuestionForm from './QuestionForm';
import { flowSelector } from '../../../redux/flow.reducer';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuestionTextApi,
     createQuestionNodeOtionsFields, 
     updateQuestionNodeOtionsFieldsApi,
    setQuestionRoutesFieldsKeysValue, 
 setQuestionDefaultRouting } from '../../../redux/question.reducer';

import NextStepModel from '../../../utility/nextStepsModel/NextStepModel';

const defaultQuestionData = {
    type: 'question',
    label: 'Question Node',
    question: {
        text: '',
        options: [],
        label: ''
    },
    routing: {
        inputMappings: {},
        routingMap: {},
        default: null
    }
};

const Question = ({ data = defaultQuestionData, onUpdate, onDelete }) => {
    const [questionData, setQuestionData] = useState(defaultQuestionData);
    const dispatch = useDispatch();

    // ========== REDUX STATE FLOW GLOBAL STATE=========== //
    const { currentFlow } = useSelector(flowSelector);
    const { currentSelectedNode } = currentFlow;

    console.log("current selected node in question: ", currentSelectedNode);

    useEffect(() => {
        // Initialize from selected node or prop data
        const nodeData = currentSelectedNode || data;
        if (nodeData) {
            setQuestionData({
                type: nodeData.type || 'question',
                label: nodeData.label || 'Question Node',
                question: {
                    text: nodeData.question?.text || '',
                    options: nodeData.question?.options || [],
                    label: nodeData.question?.label || ''
                },
                routing: {
                    inputMappings: nodeData.routing?.inputMappings || {},
                    routingMap: nodeData.routing?.routingMap || {},
                    default: nodeData.routing?.default || null
                }
            });
        }
    }, [currentSelectedNode, data]);

    const handleQuestionTextChange = (updatedQuestion) => {
        setQuestionData(prev => ({
            ...prev,
            question: {
                ...prev.question,
                text: updatedQuestion.text
            }
        }));
    };

    // ========== function to update question text ===========//
    const handleQuestionUpdate = (updatedQuestion) => {
        if (currentFlow?._id && currentSelectedNode?._id) {
            dispatch(updateQuestionTextApi({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                updateText: updatedQuestion.text
            }));
        }
    };


    // ========== function to create question node options fields ===========//
    const handleCreateOptionsFields = () => {
        if (currentFlow?._id && currentSelectedNode?._id) {
            dispatch(createQuestionNodeOtionsFields({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id
            }));
        }
    };



    // ========== function handle update question node options fields ===========//
    const handleUpdateOptionsFields = async (optionId, updateData) => {
        if (!currentFlow?._id || !currentSelectedNode?._id) return;

        try {
            dispatch(updateQuestionNodeOtionsFieldsApi({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                optionId,
                updateData
            }));
        } catch (error) {
            console.error('Error updating question options:', error);
        }
    };


    // ---------- state manage for options routing next ------------//
    const [showNextStepModal, setShowNextStepModal] = useState(false);
    const [activeOptionId, setActiveOptionId] = useState(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

    // ----------- managed state for default routinng ------------//

    const [nextModelOpenForDefaultRoute, setNextModelOpenForDefaultRoute] = useState(false);








    const handleSelectNextRoute = (optionId, event) => {
        // Set position relative to the button click
        setModalPosition({
            x: event.clientX,
            y: event.clientY
        });
        setActiveOptionId(optionId);
        setShowNextStepModal(true);
    };

    const handleNextStepSelect = (selectedNode) => {
        if (currentFlow?._id && currentSelectedNode?._id && activeOptionId) {
            dispatch(setQuestionRoutesFieldsKeysValue({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                optionId: activeOptionId,
                routerValueId: selectedNode.nodeId
            }));
        }
    };

    // ------ model for options routing next ------//
    const handleNextStepClose = () => {
        setShowNextStepModal(false);
        setActiveOptionId(null);
    };



    //------- model for default question routing ------//
    function getDefaultRoutingValue(result){
        if(result){
            dispatch(setQuestionDefaultRouting({
                flowId: currentFlow._id,
                nodeId: currentSelectedNode._id,
                defaultRoutingId: result.nodeId
            }));
        }
    }






    return (
        <div className={styles.questionNode}>
            <div className={styles.header}>
                <h3>Question Node</h3>
                {onDelete && (
                    <button onClick={onDelete} className={styles.deleteButton}>
                        Delete
                    </button>
                )}
            </div>

         

            <div className={styles.content}>
                <QuestionForm
                    question={currentSelectedNode?.question || defaultQuestionData.question}
                    routing={currentSelectedNode?.routing || defaultQuestionData.routing}
                    onQuestionUpdate={handleQuestionUpdate}
                    onUpdateOption={handleUpdateOptionsFields}
                    onSelectNextRoute={handleSelectNextRoute}
                />
                <div className={styles.divider} />
            </div>

            {/* ========== add options button =========== */}
            <div className={styles.questionFooterDiv}>
                <div onClick={()=>handleCreateOptionsFields()}
                 className={styles.addOptionsButtonDiv}>
                    Add Options
                </div>

                <div className={styles.defaultRoutingDiv}>
                    <label>Default Routing:</label>
                    <p className={styles.defaultRoutingTag}
                     onClick={() => setNextModelOpenForDefaultRoute(true)}>
                        {currentSelectedNode?.routing?.default || 'Select Default Routing'}
                     </p>

                    { nextModelOpenForDefaultRoute && (
                        <NextStepModel
                            position={currentSelectedNode?.position || { x: 0, y: 0 }}
                            onSelect={getDefaultRoutingValue}
                            onClose={() => setNextModelOpenForDefaultRoute(false)}
                        />
                    )}


                </div>
            </div>

            {showNextStepModal && (
                <NextStepModel
                    position={modalPosition}
                    onSelect={handleNextStepSelect}
                    onClose={handleNextStepClose}
                />
            )}
        </div>
    );
};

export default Question;









































// import React, { useState, useEffect } from 'react';
// import styles from '../questionCs/Question.module.css';
// import QuestionForm from './QuestionForm';
// import { flowSelector } from '../../../redux/flow.reducer';
// import { useSelector, useDispatch } from 'react-redux';
// import { updateQuestionTextApi,
//      createQuestionNodeOtionsFields, 
//      updateQuestionNodeOtionsFieldsApi,
//     setQuestionRoutesFieldsKeysValue, 
//  setQuestionDefaultRouting } from '../../../redux/question.reducer';

// import NextStepModel from '../../../utility/nextStepsModel/NextStepModel';

// const defaultQuestionData = {
//     type: 'question',
//     label: 'Question Node',
//     question: {
//         text: '',
//         options: [],
//         label: ''
//     },
//     routing: {
//         inputMappings: {},
//         routingMap: {},
//         default: null
//     }
// };

// const Question = ({ data = defaultQuestionData, onUpdate, onDelete }) => {
//     const [questionData, setQuestionData] = useState(defaultQuestionData);
//     const dispatch = useDispatch();

//     // ========== REDUX STATE FLOW GLOBAL STATE=========== //
//     const { currentFlow } = useSelector(flowSelector);
//     const { currentSelectedNode } = currentFlow;

//     useEffect(() => {
//         // Initialize from selected node or prop data
//         const nodeData = currentSelectedNode || data;
//         if (nodeData) {
//             setQuestionData({
//                 type: nodeData.type || 'question',
//                 label: nodeData.label || 'Question Node',
//                 question: {
//                     text: nodeData.question?.text || '',
//                     options: nodeData.question?.options || [],
//                     label: nodeData.question?.label || ''
//                 },
//                 routing: {
//                     inputMappings: nodeData.routing?.inputMappings || {},
//                     routingMap: nodeData.routing?.routingMap || {},
//                     default: nodeData.routing?.default || null
//                 }
//             });
//         }
//     }, [currentSelectedNode, data]);

//     const handleQuestionTextChange = (text) => {
//         setQuestionData(prev => ({
//             ...prev,
//             question: {
//                 ...prev.question,
//                 text
//             }
//         }));
//     };


//     // ========== function to update question text ===========//
//     const handleQuestionUpdate = (updatedQuestion) => {
//         if (currentFlow?._id && currentSelectedNode?._id) {
//             dispatch(updateQuestionTextApi({
//                 flowId: currentFlow._id,
//                 nodeId: currentSelectedNode._id,
//                 updateText: updatedQuestion.text
//             }));
//         }
//     };


//     // ========== function to create question node options fields ===========//
//     const handleCreateOptionsFields = () => {
//         if (currentFlow?._id && currentSelectedNode?._id) {
//             dispatch(createQuestionNodeOtionsFields({
//                 flowId: currentFlow._id,
//                 nodeId: currentSelectedNode._id
//             }));
//         }
//     };



//     // ========== function handle update question node options fields ===========//
//     const handleUpdateOptionsFields = async (optionId, updateData) => {
//         if (!currentFlow?._id || !currentSelectedNode?._id) return;

//         try {
//             dispatch(updateQuestionNodeOtionsFieldsApi({
//                 flowId: currentFlow._id,
//                 nodeId: currentSelectedNode._id,
//                 optionId,
//                 updateData
//             }));
//         } catch (error) {
//             console.error('Error updating question options:', error);
//         }
//     };


//     // ---------- state manage for options routing next ------------//
//     const [showNextStepModal, setShowNextStepModal] = useState(false);
//     const [activeOptionId, setActiveOptionId] = useState(null);
//     const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

//     // ----------- managed state for default routinng ------------//

//     const [nextModelOpenForDefaultRoute, setNextModelOpenForDefaultRoute] = useState(false);








//     const handleSelectNextRoute = (optionId, event) => {
//         // Set position relative to the button click
//         setModalPosition({
//             x: event.clientX,
//             y: event.clientY
//         });
//         setActiveOptionId(optionId);
//         setShowNextStepModal(true);
//     };

//     const handleNextStepSelect = (selectedNode) => {
//         if (currentFlow?._id && currentSelectedNode?._id && activeOptionId) {
//             dispatch(setQuestionRoutesFieldsKeysValue({
//                 flowId: currentFlow._id,
//                 nodeId: currentSelectedNode._id,
//                 optionId: activeOptionId,
//                 routerValueId: selectedNode.nodeId
//             }));
//         }
//     };

//     // ------ model for options routing next ------//
//     const handleNextStepClose = () => {
//         setShowNextStepModal(false);
//         setActiveOptionId(null);
//     };



//     //------- model for default question routing ------//
//     function getDefaultRoutingValue(result){
//         if(result){
//             dispatch(setQuestionDefaultRouting({
//                 flowId: currentFlow._id,
//                 nodeId: currentSelectedNode._id,
//                 defaultRoutingId: result.nodeId
//             }));
//         }
//     }






//     return (
//         <div className={styles.questionNode}>
//             <div className={styles.header}>
//                 <h3>Question Node</h3>
//                 {onDelete && (
//                     <button onClick={onDelete} className={styles.deleteButton}>
//                         Delete
//                     </button>
//                 )}
//             </div>

//             <div className={styles.content}>
//                 <QuestionForm
//                     question={currentSelectedNode?.question || defaultQuestionData.question}
//                     routing={currentSelectedNode?.routing || defaultQuestionData.routing}
//                     onQuestionChange={handleQuestionUpdate}
//                     onUpdateOption={handleUpdateOptionsFields}
//                     onSelectNextRoute={handleSelectNextRoute}
//                 />
//                 <div className={styles.divider} />
//             </div>

//             {/* ========== add options button =========== */}
//             <div className={styles.questionFooterDiv}>
//                 <div onClick={()=>handleCreateOptionsFields()}
//                  className={styles.addOptionsButtonDiv}>
//                     Add Options
//                 </div>

//                 <div className={styles.defaultRoutingDiv}>
//                     <label>Default Routing:</label>
//                     <p className={styles.defaultRoutingTag}
//                      onClick={() => setNextModelOpenForDefaultRoute(true)}>
//                         {currentSelectedNode?.routing?.default || 'Select Default Routing'}
//                      </p>

//                     { nextModelOpenForDefaultRoute && (
//                         <NextStepModel
//                             position={currentSelectedNode?.position || { x: 0, y: 0 }}
//                             onSelect={getDefaultRoutingValue}
//                             onClose={() => setNextModelOpenForDefaultRoute(false)}
//                         />
//                     )}


//                 </div>
//             </div>

//             {showNextStepModal && (
//                 <NextStepModel
//                     position={modalPosition}
//                     onSelect={handleNextStepSelect}
//                     onClose={handleNextStepClose}
//                 />
//             )}
//         </div>
//     );
// };

// export default Question;
