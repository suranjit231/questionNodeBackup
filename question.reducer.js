import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    selectedQuestionNode: null,
    loading: false,
    error: null
};



//========== Update quetsion node ===========//
export const updateQuestionTextApi = createAsyncThunk("questionNode/updateTextApi",
    async ({flowId, nodeId, updateText}, thunkApi)=>{
        try{
            console.log("updateQuestionTextApi called: ", flowId, nodeId, updateText);
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/questions/updateQuestionText`, 
            { 
                flowId, 
                nodeId,
                updateText: updateText
            },
            { withCredentials: true }
            );

            console.log("Full API response:", JSON.stringify(response.data, null, 2));

            if (response.data?.success) {
                // Extract the actual flow data from the nested structure
                const flowData = {
                    success: true,
                    data: response.data.data.data  // Get the inner data object
                };
                
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: flowData
                });

                // Then set the selected node
                if (flowData.data?.nodes) {
                    const updatedNode = flowData.data.nodes.find(node => node._id === nodeId);
                    console.log("Found updated node:", updatedNode);
                    
                    if (updatedNode) {
                        thunkApi.dispatch({
                            type: 'flow/setSelectedNode',
                            payload: nodeId
                        });
                    }
                }
            }

            return response.data;
        }catch(error){
            console.error('Error updating question text:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }       
)


// ========== create questions options fields ===============//
export const createQuestionNodeOtionsFields = createAsyncThunk(
    'questionNode/createOtionsFields',
    async ({ flowId, nodeId }, thunkApi) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/questions/createOptions`,
                { flowId, nodeId },
                { withCredentials: true }
            );

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }   

            return response.data;
        } catch (error) {
            console.error('Error creating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  



// ========== update question node options fields ===========//
export const updateQuestionNodeOtionsFieldsApi = createAsyncThunk(
    'questionNode/updateOtionsFields',
    async ({ flowId, nodeId, optionId, updateData }, thunkApi) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/questions/updateOptions`,
                { flowId, nodeId, optionId, updateData },
                { withCredentials: true }
            );

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error updating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  




// ========= set question node router keys value fields ===============//
export const setQuestionRoutesFieldsKeysValue = createAsyncThunk(
    'questionNode/setRouterKeysValue',
    async ({ flowId, nodeId, optionId, routerValueId }, thunkApi) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/questions/setRouterMapKeysValue`,
                { flowId, nodeId, optionId, routerValueId },
                { withCredentials: true }
            );  

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error updating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  




// ======== set question default routing ===========//
export const setQuestionDefaultRouting = createAsyncThunk(
    'questionNode/setDefaultRouting',
    async ({ flowId, nodeId, defaultRoutingId }, thunkApi) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/questions/setDefaultRouting`,
                { flowId, nodeId, defaultRoutingId },
                { withCredentials: true }
            );

            if (response.data?.data) {
                thunkApi.dispatch({
                    type: 'flow/getFlowApi/fulfilled',
                    payload: response.data
                });

                thunkApi.dispatch({
                    type: 'flow/setSelectedNode',
                    payload: nodeId
                });
            }

            return response.data;
        } catch (error) {
            console.error('Error updating question node options fields:', error);
            return thunkApi.rejectWithValue(error.response?.data);
        }
    }
);  



// ========== questionSlice for managing question state ============//
const questionSlice = createSlice({
    name: 'questionNode',
    initialState,
    reducers: {
        setSelectedQuestionNode(state, action) {
            state.selectedQuestionNode = action.payload;
        },
        clearSelectedQuestionNode(state) {
            state.selectedQuestionNode = null;
        }
    },

    extraReducers: (builder)=>{
        builder
        
        // ========= updating question node text =========//
        .addCase(updateQuestionTextApi.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })

        //======= creating question node options fields ======//
        .addCase(createQuestionNodeOtionsFields.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })

        //======= updating question node options fields ======//
        .addCase(updateQuestionNodeOtionsFieldsApi.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })

        //======= set question node router keys value fields ======//
        .addCase(setQuestionRoutesFieldsKeysValue.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })


        // ======= set question default routing ======//
        .addCase(setQuestionDefaultRouting.fulfilled, (state, action)=>{
            state.loading = false;
            if (action.payload?.data) {
                const selectedNodeId = state.selectedQuestionNode?._id;
                if (selectedNodeId) {
                    state.selectedQuestionNode = action.payload.data.nodes.find(
                        node => node._id === selectedNodeId && node.type === 'question'
                    ) || null;
                }
            }   
        })
    }
})


export const questionActions = questionSlice.actions;
export const questionReducer = questionSlice.reducer;
export const questionSelector = (state) => state.questionNode;
