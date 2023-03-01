import { useEffect, useState } from "react"
import { Button, Pressable, Text, TextInput, View } from "react-native"
import { myClient } from "../.."
import styles from "./styles"
interface Props{
    navigation: any,
    route: any
}
const ReportScreen = ({navigation, route} :Props)=>{
    const [reasons, setReasons] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [otherReason, setOtherReason] = useState("")
    const [selectedId, setSelectedId] = useState(-1)
    useEffect(()=>{
        const getTags =async () => {
            try {
                const res = await myClient.getReportTags({
                    type: 0
                })
                // console.log("the res is", res)
                setReasons(res.report_tags)
            } catch (error) {
                console.log(error)
            }
        }
       getTags()
        
    },[])
    const reportMessage = async () =>{
        try {
            const call = await myClient.pushReport({
                conversation_id: route.params.convoId,
                tag_id: selectedId,
                reason: otherReason != "" ? otherReason : undefined
            })
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <View style={styles.page}>
            <View>
                <Text>Please Select the available reason for reporting the message</Text>
            </View>
            <View style={{
                // flex: 1,
                flexDirection:'row',
                flexWrap: 'wrap',
                marginTop: 24,
                
            }}>
                {
                    reasons.map((res:any, index: number)=>{
                        return (
                            <Pressable
                            onPress={()=>{
                                setSelectedIndex(index)
                                setSelectedId(res.id)
                            }}
                            >
                        <View style={{
                            backgroundColor: index == selectedIndex ? 'black':"gray",
                            borderColor: "black",
                            borderRadius: 16,
                            padding: 8,
                            margin: 8,
                            
                        }}
                        
                        >
                            <Text style={{
                                color: selectedIndex == index ? "white" : 'black'
                            }}>
                            {res.name}
                            </Text>
                        </View>
                        </Pressable>
                        )
                    })
                }
              
               
            </View>
            {
                selectedIndex == 5 ?
                <View style={{
                    marginTop: 24,
                    flex: 3
                }}>
                    <TextInput
                        onChangeText={(e)=>{
                            setOtherReason(e)
                        }}
                        style={{
                            margin: 12,
                            height: 40,
                            borderWidth: 1,
                            padding: 10
                        }}
                        placeholder="Enter the reason for Reporting this conversation"
                        value={otherReason}/>
                </View>:null
            }
            <View>
                <Button title="REPORT" onPress={()=>{
                    reportMessage()
                    navigation.goBack()
                }}/>
                   
                
            </View>
        </View>
    )
}

export default ReportScreen