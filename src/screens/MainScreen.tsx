import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import createElement from '../components/Elements';
import AceEditor from "react-ace";
import axios from "axios";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import {settings} from "../components/settingfile"
export default function MainScreen (){
  const [filedata,setfiledata] = useState({})
  const [Data,setData] = useState([])
  const [filename,setfilename] = useState("")
  const [inputData,setInput] = useState({})
	function checkselect(e){
		renderFile(e.name)
	}
  useEffect(()=>{
    axios.get(settings["folderstructure"]["url"]).then(e=>{
      let v= e.data
      setData(v['data'])
    })
  },[])
	function createTree(node){
		if(node.type == "file"){
			return <TreeItem nodeId={String(Math.random()*100)} key = {String(Math.random()*100)} label={node.name} onClick = {()=>checkselect(node)} />
		}
		return <TreeItem nodeId={String(Math.random()*100)} key = {String(Math.random()*100)} label={node.name}>
							{
								node.children.map((n,id)=>{
									return createTree(n)
								})
							}
						</TreeItem>
	}
  function createUI(data){
    if(!data["multiple"]){
      console.log(data["type"])
      return <>
      <div className='text-lg '>{data["name"]}</div>
      {createElement(data["type"],{"onChange":(e)=>SetInputData(e.target.value,data["name"])})}
      </>
    }
    return data["valid_keys_in_items"].map((element,idx) => {
      return createUI(element)
    });
  }
  function renderFile(filepath){
		axios.get(settings["filedata"]["url"]+filepath).then(res=>{
			  let jsn = res.data
        console.log(jsn["root"])
				setfiledata(jsn)
        setfilename(filepath)
        let temp  = inputData
        temp["file"] = filepath
        temp["variables"] = {
          "aggregates":[],
          "device_name":"",
          "uplink_devices":"",
          "sysloc":"",
          "vlans":[]
        }
        setInput(temp)
		})
  }
  function SetInputData(data,key){
    let temp = inputData
    if(key == "id" || key == "size"){
      if(!temp["variables"]["vlans"][0]){temp["variables"]["vlans"][0] = {}}
      temp["variables"]["vlans"][0][key] = data
    }
    else if(key == "aggregates"){
      temp["variables"]["aggregates"][0] = data
    }
    else{
      temp["variables"][key] = data
    }
    setInput(temp)
    console.log(inputData)
  }
  function OnSubmit(){
    setfiledata(inputData)

  }
    return (
      <div className='flex flex-col h-screen'>
          <div>
              <Header />
          </div>
          <div className='flex flex-row h-full'>
              <div className='flex w-1/5 bg-white-100 h-full'>
                <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                >
                {	
									Data.map((node,idx)=>createTree(node))
								}
                </TreeView>
              </div>


              <div className='flex w-2/5 bg-blue-100 h-full justify-center items-center'>
                {filedata["root"]?
                <div className='flex flex-col justify-around h-full'>
                  <div className='text-lg text-center font-bold'>
                    {filename}
                  </div>
                    {
                      filedata["root"].map((element,idx) => {
                        return createUI(element)
                      })
                    }
                  <div className='flex justify-center'>
                    <button className='border-solid border-2 border-black px-2 py-1 rounded-lg bg-blue-400' type='button' onClick={()=>OnSubmit()}>Submit</button>
                  </div>
                </div>
                :null 
                }     
              </div>

              <div className='flex w-2/5 bg-blue-100 h-full '>
                <AceEditor
                placeholder=""
                theme="white"
                mode = "json"
                name="blah2"
                height='100%'
                width='100%'
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                wrapEnabled
                highlightActiveLine={true}
                value={!filedata["root"]?JSON.stringify(filedata, null, '\t'):""}
                setOptions={{
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showLineNumbers: true,
                tabSize: 2,
                }}/>

              </div>

          </div>
      </div>
    )
}
