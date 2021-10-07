import React from 'react'
import { View,Text,TouchableOpacity,StyleSheet,Image,TextInput} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as firebase from 'firebase'
import db from '../config'

export default class BookTransactionScreen extends React.Component{
    constructor(){
      super()
      this.state = {
        hasCameraPermissions : null,
        scanned : false,
        scannedBookId : "",
        scannedStudentId : "",
        buttonState : "normal",
      }
    }

    getCameraPermissions = async (id) => {
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions : status === "granted",
            buttonState : id,
            scanned : false,
        })
    }

    handleBarcodeScanned = async({type,data}) => {
      const {buttonState} = this.state
      if(buttonState === "BookId") {
        this.setState({
          scanned : true,
          scannedBookId : data,
          buttonState : "normal",
        })
      }
      else if(buttonState === "StudentId"){
        this.setState({
          scanned : true,
          scannedStudentId : data,
          buttonState : "normal",
        })
      }
    }

    initiateBookIssue = async() => {
      db.collection("transactions").add({
        "studentId" : this.state.scannedBookId,
        "bookId" : this.state.scannedBookId,
        "data" : firebase.firestore.Timestamp.now().toDate(),
        "transactionType" : "issue",
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        "bookAvailability" : false,
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        "numberOfBooksIssued" : firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedStudentId : "",
        scannedBookId : "",
      })
    }

    initiateBookReturn = async() => {
      db.collection("transactions").add({
        "studentId" : this.state.scannedBookId,
        "bookId" : this.state.scannedBookId,
        "data" : firebase.firestore.Timestamp.now().toDate(),
        "transactionType" : "return",
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        "bookAvailability" : true,
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        "numberOfBooksIssued" : firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedStudentId : "",
        scannedBookId : "",
      })
    }

    handleTransaction = async() =>{
      var transactionMesg = null;
      db.collection("books").doc(this.state.scannedBookId).get()
      .then((doc)=>{
        var book = doc.data()
        if(book.bookAvailability){
          this.initiateBookIssue()
          transactionMesg = "Book Issued"
        }
        else{
          this.intiateBookReturn()
          transactionMesg = "Book Returned"
        }
      })
    }

    render(){ 
        const hasCameraPermissions = this.state.hasCameraPermissions
        const scanned = this.state.scanned
        const buttonState = this.state.buttonState

        if(buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner 
                   onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScanned}
                   style = {StyleSheet.absoluteFillObject}
                />
            )
        }

        else if(buttonState === "normal") {
            return(
                <View style = {styles.container}>
                  <View>
                    <Image 
                      source = {require("../assets/book.png")}
                      style = {{width : 150, height : 150,}}
                    />
                    <Text style = {{textAlign : 'center', fontSize : 30, fontWeight : 'bold',}} > Wily</Text>
                  </View> 
                  <View>
                    <TextInput 
                      style = {styles.inputBox}
                      placeholder = "Book Id"
                      value = {this.state.scannedBookId}
                    />
                    <TouchableOpacity 
                      style = {styles.scanButton}
                      onPress = {this.getCameraPermissions("BookId")}
                    >
                      <Text style = {styles.buttonText}> Scan </Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                  <TextInput 
                      style = {styles.inputBox}
                      placeholder = "Student Id"
                      value = {this.state.scannedStudentId}
                    />
                    <TouchableOpacity 
                      style = {styles.scanButton}
                      onPress = {this.getCameraPermissions("StudentId")}
                    >
                      <Text style = {styles.buttonText}> Scan </Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <Text style = {styles.transactionAlert}> {this.state.transactionMesg} </Text>
                    <TouchableOpacity style = {styles.scanButton} onPress = {async() =>{
                      var transactionMesg = await this.handleTransaction
                    }}>
                      <Text style = {styles.buttonText}> Submit </Text>
                    </TouchableOpacity>
                  </View>
                </View>
            )
        }

    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText:{
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10
  },
  inputView:{
    flexDirection: 'row',
    margin: 20
  },
  inputBox:{
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0
  },
  
});