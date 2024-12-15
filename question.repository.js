import QuestionNode from "./question.schema.js";
import flowModel from "../flow/flowSchema.js";
import { AppError } from "../../middleware/errorHandler.middleware.js";
import { NODE_TYPES } from "../flow/flowSchema.js";
import FlowRepository from "../flow/flow.repository.js";

export default class QuestionRepository {

    constructor(){
        this.flowRepository = new FlowRepository();
    }

    // ========== create new question node ===========//
    async createQuestionNode(flowId, questionNodeData) {
        try {
            const { position, question, routing } = questionNodeData;

            // Position is required for UI placement
            if (!position || !position.x || !position.y) {
                throw new AppError("Position with x and y coordinates is required", 400);
            }

            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Create structured node data
            const nodeData = {
                position,
                // Initialize empty question structure if not provided
                question: question || {
                    text: '',
                    options: []
                },
                // Initialize empty routing structure if not provided
                routing: routing || {
                    inputMappings: {},
                    routingMap: {},
                    default: null
                }
            };

            // Create the question node
            const questionNode = new QuestionNode(nodeData);

            // Save the question node
            const savedQuestionNode = await questionNode.save();

            // Add the node reference to the flow
            flow.nodes.push({
                type: NODE_TYPES.QUESTION,  // Use the enum value
                ref: savedQuestionNode._id,
                refModel: 'QuestionNode'
            });

            // Save the updated flow
            await flow.save();

            return {
                success: true,
                message: "Question node created successfully",
                data: savedQuestionNode
            };
        } catch (error) {
            throw error;
        }
    }

    // ========== update question node ===========//
    async updateQuestionNode(flowId, nodeId, updateData) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Check if node exists in flow
            const nodeExists = flow.nodes.some(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'QuestionNode'
            );
            if (!nodeExists) {
                throw new AppError("Question node not found in flow", 404);
            }

            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Update label if provided
            if (updateData.label) {
                questionNode.label = updateData.label;
            }

            // Update position if provided
            if (updateData.position) {
                questionNode.position = updateData.position;
            }

            // Update question data if provided
            if (updateData.question) {
                questionNode.question = {
                    ...questionNode.question,
                    ...updateData.question
                };
            }

            // Handle Map fields in routing if they exist
            if (updateData.routing) {
                if (updateData.routing.inputMappings) {
                    questionNode.routing.inputMappings = { ...questionNode.routing.inputMappings, ...updateData.routing.inputMappings };
                }
                if (updateData.routing.routingMap) {
                    questionNode.routing.routingMap = { ...questionNode.routing.routingMap, ...updateData.routing.routingMap };
                }
                if (updateData.routing.default) {
                    questionNode.routing.default = updateData.routing.default;
                }
                // Remove routing from updateData since we handled it separately
                delete updateData.routing;
            }

            // Update other fields
            Object.assign(questionNode, updateData);
            
            // Save the updated node
            const updatedNode = await questionNode.save();

            return {
                success: true,
                message: "Question node updated successfully",
                data: updatedNode
            };
        } catch (error) {
            throw error;
        }
    }

    // ========== delete question node ===========//
    async deleteQuestionNode(flowId, nodeId) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Check if node exists in flow and is a question node
            const nodeIndex = flow.nodes.findIndex(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'QuestionNode'
            );
            if (nodeIndex === -1) {
                throw new AppError("Question node not found in flow", 404);
            }

            // Find the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Remove the node from the flow
            flow.nodes.splice(nodeIndex, 1);

            // Remove any edges connected to this node
            flow.edges = flow.edges.filter(edge => 
                edge.source.toString() !== nodeId && 
                edge.target.toString() !== nodeId
            );

          

            const deletedNode = await QuestionNode.findByIdAndDelete(nodeId);
           const updatedFlow = await flow.save();

            return {
                success: true,
                message: "Question node deleted successfully",
                data: {
                    node: deletedNode,
                    flow: updatedFlow
                }
            };
        } catch (error) {
            throw error;
        }
    }


    // ========== update question node text ===========//
    async updateQuestionText(flowId, nodeId, updateText) {
        try {


            console.log("updateQuestionText called: ", flowId, nodeId, updateText);
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Find the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Update the question text
            questionNode.question.text = updateText;

            // Save the updated node
            const updatedNode = await questionNode.save();
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: "Question node text updated successfully",
                data: updatedFlow
            };
        } catch (error) {
            throw error;
        }
    }   


    // ===========  create question nodes options fields ============//
    async createQuestionNodeOtionsFields(flowId, nodeId) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Find the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Initialize empty option with required structure
            const emptyOption = {
                label: '',
                value: '',
                synonyms: []
            };

            // Add the empty option to the options array
            if (!questionNode.question.options) {
                questionNode.question.options = [];
            }
            questionNode.question.options.push(emptyOption);

            // Initialize or update routing
            if (!questionNode.routing) {
                questionNode.routing = {
                    inputMappings: {},
                    routingMap: {},
                    default: ''
                };
            }

            // Add empty entries in inputMappings and routingMap for this option
            questionNode.routing.inputMappings[emptyOption.value] = [];
            questionNode.routing.routingMap[emptyOption.value] = '';

            // Save the updated node
            const updatedNode = await questionNode.save();

            // Get the updated flow to return
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: "Question node options fields created successfully",
                data: updatedFlow.data
            };

        } catch (error) {
            throw new AppError(error.message || "Error creating question node options fields", error.status || 500);
        }
    }


    // ========= update question nodes options fields ====================//
    async updateQuestionNodeOptionsFields(flowId, nodeId, optionId, updateData) {
        try {
            // Find the flow first
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            console.log("Starting update with data:", updateData);

            // Find the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Find the option to update
            const optionIndex = questionNode.question.options.findIndex(
                option => option._id.toString() === optionId
            );

            if (optionIndex === -1) {
                throw new AppError("Option not found", 404);
            }

            // Get the old option value and its routing target
            const oldValue = questionNode.question.options[optionIndex].value;
            console.log("Old value:", oldValue);
            
            // Get the routing target for this option if it exists
            const routingTarget = questionNode.routing?.routingMap?.get(oldValue);
            console.log("Current routing target:", routingTarget);

            // Update the option
            questionNode.question.options[optionIndex] = {
                ...questionNode.question.options[optionIndex],
                ...updateData
            };

            // Get the updated option
            const updatedOption = questionNode.question.options[optionIndex];
            console.log("Updated option:", updatedOption);

            // Initialize routing if needed
            if (!questionNode.routing) {
                questionNode.routing = {
                    inputMappings: new Map(),
                    routingMap: new Map(),
                    default: null
                };
            }

            // Handle routing updates
            if (oldValue !== updatedOption.value) {
                console.log("Value changed from", oldValue, "to", updatedOption.value);
                
                // Remove old mappings
                if (oldValue && oldValue !== '') {
                    questionNode.routing.inputMappings.delete(oldValue);
                    questionNode.routing.routingMap.delete(oldValue);
                }

                // Set new mappings
                if (updatedOption.value && updatedOption.value !== '') {
                    // Update inputMappings with value and synonyms
                    const inputMappingArray = [
                        updatedOption.value,
                        ...(updatedOption.synonyms || [])
                    ];
                    questionNode.routing.inputMappings.set(updatedOption.value, inputMappingArray);
                    questionNode.markModified('routing.inputMappings');

                    // Preserve routing target if it existed
                    if (routingTarget) {
                        console.log("Preserving routing target:", routingTarget);
                        questionNode.routing.routingMap.set(updatedOption.value, routingTarget);
                    } else if (!questionNode.routing.routingMap.has(updatedOption.value)) {
                        questionNode.routing.routingMap.set(updatedOption.value, '');
                    }
                    questionNode.markModified('routing.routingMap');
                }

                // Update flow edges if needed
                if (routingTarget) {
                    const edgeIndex = flow.edges.findIndex(edge => 
                        edge.source.toString() === nodeId && 
                        edge.target.toString() === routingTarget
                    );
                    
                    if (edgeIndex !== -1) {
                        flow.edges[edgeIndex].optionValue = updatedOption.value;
                        await flow.save();
                    }
                }
            }

            // Save the updated node
            await questionNode.save();

            console.log("Final routing state:", {
                inputMappings: Object.fromEntries(questionNode.routing.inputMappings),
                routingMap: Object.fromEntries(questionNode.routing.routingMap)
            });

            // Get the updated flow
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: "Question node options fields updated successfully",
                data: updatedFlow.data
            };

        } catch (error) {
            console.error("Error in updateQuestionNodeOptionsFields:", error);
            throw new AppError(error.message || "Error updating question node options fields", error.status || 500);
        }
    }




    // ========== set and update question router fields ===============//
    async setQuestionRoutesFieldsKeysValue(flowId, nodeId, optionId, routerValueId) {
        try {
            // Find the flow
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // Find the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // Find the option
            const optionIndex = questionNode.question.options.findIndex(
                option => option._id.toString() === optionId
            );
            if (optionIndex === -1) {
                throw new AppError("Option not found", 404);
            }

            const option = questionNode.question.options[optionIndex];

            // Update the routingMap for this option's value
            if (!questionNode.routing) {
                questionNode.routing = {
                    inputMappings: new Map(),
                    routingMap: new Map(),
                    default: null
                };
            }

            questionNode.routing.routingMap.set(option.value, routerValueId);
            questionNode.markModified('routing.routingMap');
            await questionNode.save();

            // Check if an edge already exists
            const edgeExists = flow.edges.some(
                edge => edge.source.toString() === nodeId && 
                       edge.target.toString() === routerValueId
            );

            // If edge doesn't exist, create it
            if (!edgeExists) {
                flow.edges.push({
                    source: nodeId,
                    target: routerValueId
                });
                await flow.save();
            }

            // Get the updated flow
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: "Question routing updated successfully",
                data: updatedFlow.data
            };

        } catch (error) {
            console.error("Error in setQuestionRoutesFieldsKeysValue:", error);
            throw new AppError(error.message || "Error updating question routing", error.status || 500);
        }
    }



    // ========== set default routing for question node ============//
    async setDefaultRouting(flowId, nodeId, defaultRoutingId) { 

        try{
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            const nodeExists = flow.nodes.some(node => 
                node.ref.toString() === nodeId && 
                node.refModel === 'QuestionNode'
            );
            if (!nodeExists) {
                throw new AppError("Question node not found in flow", 404);
            }

            const nextNodeExists = flow.nodes.some(node => 
                node.ref.toString() === defaultRoutingId
            );
            if (!nextNodeExists) {
                throw new AppError("Next node not found in flow", 404);
            }

            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Reply node not found", 404);
            }

            // Update the default routing in the question node
            questionNode.routing.default = defaultRoutingId;
            await questionNode.save();

            // Find existing default routing edge
            const existingDefaultEdgeIndex = flow.edges.findIndex(edge => 
                edge.source.toString() === nodeId &&
                edge.isDefaultRoute === true // Only look for default routing edges
            );

            if (existingDefaultEdgeIndex !== -1) {
                // Update existing default edge
                flow.edges[existingDefaultEdgeIndex].target = defaultRoutingId;
            } else {
                // Create new default edge
                flow.edges.push({
                    source: nodeId,
                    target: defaultRoutingId,
                    isDefaultRoute: true // Mark this as a default routing edge
                });
            }

            await flow.save();

            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);

            return {
                success: true,
                message: "Default routing updated successfully",
                data: updatedFlow.data
            };
        }catch(error){
            console.log("error in updating default routing in question repository: ", error);
            throw error;
        }
       
    }       
}
