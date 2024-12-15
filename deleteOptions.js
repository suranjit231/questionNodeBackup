   // ========== delete option from question node ==========//
    async deleteOptionsFromQuestionNode(flowId, nodeId, optionId) {
        try {
            console.log("1. Starting option deletion process");
            
            // step 1. find the flow
            const flow = await flowModel.findById(flowId);
            if (!flow) {
                throw new AppError("Flow not found", 404);
            }

            // step 2. finds the question node
            const questionNode = await QuestionNode.findById(nodeId);
            if (!questionNode) {
                throw new AppError("Question node not found", 404);
            }

            // step 3. find the option field
            const optionIndex = questionNode.question.options.findIndex(
                option => option._id.toString() === optionId
            );
            
            if (optionIndex === -1) {
                throw new AppError("Option not found", 404);
            }
            
            const option = questionNode.question.options[optionIndex];
            console.log("2. Found option to delete:", option);
            
            // step 4. check if there routingMap nextNode id is present
            const nextNodeId = questionNode.routing?.routingMap?.get(option.value);
            console.log("3. Next node ID from routing map:", nextNodeId);
            
            if (nextNodeId) {
                console.log("4. Found next node, checking references");
                // Check if other nodes are referring to this next node
                const otherReferences = flow.edges.some(edge => 
                    edge.target.toString() === nextNodeId &&
                    edge.source.toString() !== nodeId
                );
                console.log("5. Other references exist:", otherReferences);

                if (!otherReferences) {
                    console.log("6. No other references, proceeding with node deletion");
                    // Find the node in flow.nodes using ref field
                    const node = flow.nodes.find(n => n.ref.toString() === nextNodeId);
                    if (!node) {
                        throw new AppError("Node not found in flow", 404);
                    }
                    console.log("7. Found node to delete:", node);

                    // Determine the correct model based on node type
                    let nodeModel;
                    switch (node.type) {
                        case 'start':
                            nodeModel = StartNode;
                            break;
                        case 'end':
                            nodeModel = EndNode;
                            break;
                        case 'reply':
                            nodeModel = ReplyNode;
                            break;
                        case 'question':
                            nodeModel = QuestionNode;
                            break;
                        case 'api':
                            nodeModel = ApiNode;
                            break;
                        case 'conditional':
                            nodeModel = ConditionalNode;
                            break;
                        case 'function':
                            nodeModel = FunctionalNode;
                            break;
                        case 'input':
                            nodeModel = InputNode;
                            break;
                        case 'agent_handoff':
                            nodeModel = AgentNode;
                            break;
                        default:
                            throw new AppError("Invalid node type", 400);
                    }
                    console.log("8. Selected model for type:", node.type);

                    // Remove all edges connected to this node
                    const oldEdges = [...flow.edges];
                    flow.edges = flow.edges.filter(edge => 
                        edge.source.toString() !== nextNodeId && 
                        edge.target.toString() !== nextNodeId
                    );
                    console.log("9. Removed edges:", oldEdges.filter(e => !flow.edges.includes(e)));

                    // Remove node from flow.nodes
                    const oldNodes = [...flow.nodes];
                    flow.nodes = flow.nodes.filter(n => n.ref.toString() !== nextNodeId);
                    console.log("10. Removed nodes:", oldNodes.filter(n => !flow.nodes.includes(n)));

                    // Save flow without validation first
                    console.log("11. Saving flow without validation");
                    await flow.save({ validateBeforeSave: false });

                    // Delete the node from its collection
                    await nodeModel.findByIdAndDelete(nextNodeId);
                    console.log("12. Deleted node from collection");
                }
            }

            // Remove option from routingMap and inputMappings
            questionNode.routing.routingMap.delete(option.value);
            questionNode.routing.inputMappings.delete(option.value);
            
            // Remove the option
            questionNode.question.options.splice(optionIndex, 1);

            // Mark modifications
            questionNode.markModified('routing.routingMap');
            questionNode.markModified('routing.inputMappings');
            questionNode.markModified('question.options');

            // Final validation and save
            console.log("13. Performing final validation");
            await flow.validate();
            console.log("14. Validation successful, saving flow");
            await flow.save();
            await questionNode.save();

            // Get updated flow
            const updatedFlow = await this.flowRepository.getUserFlow(flow.user);
            console.log("15. Got updated flow");

            return {
                success: true,
                message: "Option deleted successfully",
                data: updatedFlow.data
            };

        } catch (error) {
            console.error("Error in deleteOptionsFromQuestionNode:", error);
            throw new AppError(
                error.message || "Error deleting option from question node", 
                error.status || 500
            );
        }
    }
