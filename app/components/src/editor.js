import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SideControl from './sideControl';
import { Editor, EditorState, Modifier, Entity, RichUtils, ContentState, CompositeDecorator, AtomicBlockUtils, convertFromRaw, convertToRaw } from 'draft-js';
import ImageComponent from './imageComponent';

const styles = {
  editorContainer: {
    position: 'relative',
    minHeight: 500,
    width: '80%',
    backgroundColor: '#fff',
  	margin: '0 auto',
  },
  sideControl: {
  }
}

const colorStyleMap = {
	red: {
	  color: 'rgba(255, 0, 0, 1.0)',
	},
	orange: {
	  color: 'rgba(255, 127, 0, 1.0)',
	},
	yellow: {
	  color: 'rgba(180, 180, 0, 1.0)',
	},
	green: {
	  color: 'rgba(0, 180, 0, 1.0)',
	},
	blue: {
	  color: 'rgba(0, 0, 255, 1.0)',
	},
	indigo: {
	  color: 'rgba(75, 0, 130, 1.0)',
	},
	violet: {
	  color: 'rgba(127, 0, 255, 1.0)',
	},
};

const fontSizeMap = {
	small: {
		fontSize: 16,
	},
	middle: {
		fontSize: 20,
	},
	large: {
		fontSize: 30
	}
}

export default class RichEditor extends Component {
	constructor(props) {
		super(props);
    	//window.addEventListener('scroll', this._scrollBar.bind(this));
    	this.focus = () => this.refs.editor.focus();
	    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
	    this.handleFileInput = (e) => this._handleFileInput(e);
	    this.handleUploadImage = () => this._handleUploadImage();
	    this.toggleBlockType = (type) => this._toggleBlockType(type);
	    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
	    this.toggledColor = (toggledColor) => this._toggleColor(toggledColor);
	    this.toggledFontSize = (togglecFontSize) => this._toggleFontSize(togglecFontSize);
	    this.insertImage = (file) => this._insertImage(file);

	    this.state = {
	      editorState: EditorState.createEmpty(),
	      color: 0,
	      fontSize: 0
	    };
	    this.onChange = (editorState) => {
	      this.setState({
	        editorState,
	      });
	    };
	    this.blockRenderer = (block) => {
	      if (block.getType() === 'atomic') {
	        return {
	          component: ImageComponent,
	        };
	      }
	      return null;
	    };
	    this.blockStyler = (block) => {
	      if (block.getType() === 'unstyled') {
	        return 'paragraph';
	      }
	      return null;
	    };
	}

	_handleKeyCommand(command) {
	    const {editorState} = this.state;
	    const newState = RichUtils.handleKeyCommand(editorState, command);
	    if (newState) {
	      this.onChange(newState);
	      return true;
	    }
	    return false;
  	}

  	_toggleBlockType(blockType) {
	    this.onChange(
	      RichUtils.toggleBlockType(
	        this.state.editorState,
	        blockType
	      )
	    );
  	}

  	_toggleInlineStyle(inlineStyle) {
	    this.onChange(
	      RichUtils.toggleInlineStyle(
	        this.state.editorState,
	        inlineStyle
	      )
	    );
  	}

  	_insertImage(file) {
	    const  fileSrc =  typeof file == "object" ? URL.createObjectURL(file) : file;
	    const entityKey = Entity.create('atomic', 'IMMUTABLE', {
	      src: fileSrc,
	    });
	    this.onChange(AtomicBlockUtils.insertAtomicBlock(
	      this.state.editorState,
	      entityKey,
	      ' '
	    ));
  	}

  	_handleFileInput(e) {
	    const fileList = e.target.files;
	    const file = fileList[0];

	    if ( (typeof this.props.uploadImg) != "undefined" && (typeof this.props.uploadImg) == "function" ){
	      this.props.uploadImg(file,this.insertImage)
	      return 
	    }
	    this.insertImage(file);
  	}

  	_handleUploadImage() {
    	this.refs.fileInput.click();
  	}

  	_toggleColor() {

  		const {editorState} = this.state;
  		const selection = editorState.getSelection();

  		const toggledColor = this.changeColor();

  		const nextContentState = Object.keys(colorStyleMap)
  			.reduce((contentState, color) => {
  				return Modifier.removeInlineStyle(contentState, selection, color)
  			}, editorState.getCurrentContent());

  		let nextEditorState = EditorState.push(
  				editorState,
  				nextContentState,
  				'change-inline-style'
  			);

  		const currentStyle = editorState.getCurrentInlineStyle();

  		if(selection.isCollapsed()){

  			nextEditorState = currentStyle.reduce((state, color) => {
  				return RichUtils.toggleInlineStyle(state, color);
  			}, nextEditorState);
  		}

  		if (!currentStyle.has(toggledColor)) {

            nextEditorState = RichUtils.toggleInlineStyle(
              nextEditorState,
              toggledColor
            );
		}

		this.onChange(nextEditorState);
  	}

  	_toggleFontSize() {

  		const {editorState} = this.state;
  		const selection = editorState.getSelection();

  		const toggledColor = this.changeFontSize();
  		const nextContentState = Object.keys(colorStyleMap)
  			.reduce((contentState, color) => {
  				return Modifier.removeInlineStyle(contentState, selection, color)
  			}, editorState.getCurrentContent());

  		let nextEditorState = EditorState.push(
  				editorState,
  				nextContentState,
  				'change-inline-style'
  			);

  		const currentStyle = editorState.getCurrentInlineStyle();

  		if(selection.isCollapsed()){

  			nextEditorState = currentStyle.reduce((state, color) => {
  				return RichUtils.toggleInlineStyle(state, color);
  			}, nextEditorState);
  		}

  		if (!currentStyle.has(toggledColor)) {

            nextEditorState = RichUtils.toggleInlineStyle(
              nextEditorState,
              toggledColor
            );
		}

		this.onChange(nextEditorState);
  	}

  	changeColor() {
  		const colors = Object.keys(colorStyleMap);
  		const length = colors.length;

  		let currentColor = this.state.color;
  		let selectOrder = currentColor > (length - 1) ? 0 : (currentColor + 1);

  		this.setState({
  			color: selectOrder
  		})

  		return colors[selectOrder];
  	}

  	changeFontSize() {
  		const colors = Object.keys(fontSizeMap);
  		const length = colors.length;

  		let currentColor = this.state.fontSize;
  		let selectOrder = currentColor > (length - 1) ? 0 : (currentColor + 1);

  		this.setState({
  			fontSize: selectOrder
  		})

  		return colors[selectOrder];
  	}

  	getFirstBlockText() {
	    const currentContentState = this.getCurrentContent();
	    const blocksArray = currentContentState.getBlocksAsArray();
	    let _text = null;
	    for (let i = 0; i < blocksArray.length; i++) {
	      if (blocksArray[i].getText().length > 0) {
	        _text = blocksArray[i].getText();
	        break;
	      }
	    }
	    return _text;
  	}

  	getContent() {
	    const content = this.state.editorState.getCurrentContent()
	    return convertToRaw(content)
  	};

  	getEditorState() {
    	return this.state.editorState;
  	}

  	getCurrentContent() {
    	return this.state.editorState.getCurrentContent();
  	}

	componentWillUnmount() {
       //window.removeEventListener('scroll', this._scrollBar.bind(this));
  	}


	render() {
		const editorState = this.state.editorState;
		const currentInlineStyle = editorState.getCurrentInlineStyle();
		const selection = editorState.getSelection();
		const selectedBlockType = editorState
			.getCurrentContent()
      		.getBlockForKey(selection.getStartKey())
      		.getType();

 		//console.log(selectedBlockType)

    	const sideControlStyles = Object.assign({}, styles.sideControl, this.state.sideControlStyles);
      	let className = 'RichEditor-editor';

      	return (
      		<div ref="hommilyEditor" style={Object.assign({}, styles.editorContainer, this.props.style)}
      			className = "RichEditor" onClick = {this.focus}>
      			<SideControl style={sideControlStyles}
			      onImageClick={this.props.onImageClick
			      // This editor will support a real basic example of inserting an image
			      // into the page, just so something works out the box. 
			      || ((e) => this.refs['fileInput'].click())
			      }
			      toggleBlockType={this.toggleBlockType}
			      selectedBlockType={selectedBlockType}
			      toggleInlineStyle={this.toggleInlineStyle}
			      currentInlineStyle={currentInlineStyle}
			      onEditorChange={this.onChange}
			      toggledColor={this.toggledColor}
			      toggledFontSize={this.toggledFontSize}
			      EditorState ={EditorState}
			      editorState={this.state.editorState}
			      ref="sideControl"
      			/>
      			<div className={className}>
        			<Editor
				      blockRendererFn={this.blockRenderer}
				      customStyleMap={{...colorStyleMap, ...fontSizeMap}}
				      blockStyleFn={this.blockStyler}
				      editorState={editorState}
				      handleKeyCommand={this.handleKeyCommand}
				      onChange={this.onChange}
				      placeholder="Enter some text..."
				      // readOnly={this.state.editingImage}
				      ref="editor"
      				/>
         		</div>
         		<input type="file" ref="fileInput" style={{display: 'none'}} onChange={this.handleFileInput} />
      		</div>
      	);
	}
}