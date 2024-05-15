import { useState, useEffect } from "react";
import "./App.css";
import {
  readUsers,
  addUser,
  readUserById,
  customDoc,
  customCollection,
  deleteById,
} from "./core/service/firebase/db/users";
import { listenFeaturesFlags } from "./core/service/firebase/db/config";
import { signIn, signUp } from "./core/service/firebase/auth";
import { getImageUrlByName } from "./core/service/firebase/storage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./core/service/firebase/firebase";
import { addDoc, doc, collection, getDocs, deleteDoc, updateDoc, query, getDoc } from "firebase/firestore";
import { fireStoreDB } from "./core/service/firebase/firebase";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "white",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "red",
  },
  "& .MuiOutlinedInput-root": {
    color: "white",
    "& fieldset": {
      borderColor: "white",
    },
    "&:hover fieldset": {
      borderColor: "blue",
    },
    "&.Mui-focused fieldset": {
      borderColor: "pink",
    },
  },
});

import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardImage,
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";

function App() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [users, setUsers] = useState([]);
  const [deleteUserFeatureFlag, setDeleteUserFeatureFlag] = useState(true);
  let unsubscribe;

  const [imageUrl, setImageUrl] = useState('');
  const [imagen, setImagen] = useState('');
  const [imagenId, setImagenId] = useState('');
  const [imagenes, setImagenes] = useState('');

  useEffect(() => {
    getUsersCallBack();
    unsubscribe = listenFeaturesFlags((value) => {
      let { delete_users } = { ...value };
      setDeleteUserFeatureFlag(delete_users);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  let getUsersCallBack = async () => {
    let response = await readUsers();
    setUsers(response);
  };


  //AGREGAR IMAGEN

  const uploadImage = async () => {
    if (imagen == null) return null;
    const imageRef = ref(storage, `images/${imagen.name}`);
    const snapshot = await uploadBytes(imageRef, imagen);
    const url = await getDownloadURL(snapshot.ref);
    alert("imagen subida");
    return url;
  };

  const saveImage = async () => {
    const url = await uploadImage();
    await saveImagen(url);
    getImagenData();
  }

  const saveImagen = (url) => {
    addDoc(collection(fireStoreDB, "Imagenes"), { url });
  }

  useEffect(() => {
    getImagenData();
  }, []);

  const getImagenData = async () => {
    const p = await getImagen();
    console.log(p.docs[0].data());
    setImagenes(p.docs);
  }

  const getImagen = async () => {
    const result = await getDocs(query(collection(fireStoreDB, "Imagenes")));
    return result;
  }

  const updateImagenData = async () => {
    const url = await uploadImage();
    await updateImagen(imagenId, url); // Esperar a que se haga el update porque es asincrona
    getImagenData(); // Se hace de nuevo la consulta para mostrar los datos nuevos
  }

  const updateImagen = async (id, url) => { // El id que quiero actualizar y su nueva url
    await updateDoc(doc(fireStoreDB, "Imagenes", id), { url })
  }

  const removeImagen = async () => {
    await deleteImagen(imagenId);
    getImagenData();
  }

  const deleteImagen = async (id) => { // El id del que voy a borrar
    await deleteDoc(doc(fireStoreDB, "Imagenes", id));
  }


  return (<div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <>
        {users.length == 0 && <h1>No hay datos</h1>}
        {users.length > 0 &&
          users.map((user) => {
            let { name, lastName, id } = { ...user };
            return (
              <Card key={id} sx={{ minWidth: 275 }}>
                <CardContent style={{ width: '600px' }}>
                  <Typography variant="h5" component="div">
                    Name
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {name}
                  </Typography>
                  <Typography variant="h5" component="div">
                    Last Name
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {lastName}
                  </Typography>
                </CardContent>
                <CardActions>
                  {deleteUserFeatureFlag && (
                    <Button
                      onClick={async () => {
                        await deleteById(id);
                        let response = await readUsers();
                        await setUsers(response);
                      }}
                      size="small"
                    >
                      Eliminar
                    </Button>
                  )}
                  <Button size="small">Editar</Button>
                </CardActions>
              </Card>
            );
          })}
      </>
      <Box sx={{ mb: 2 }} />

      <div style={{ display: "flex", flexDirection: "row" }}>
        <CssTextField
          InputLabelProps={{
            sx: {
              color: "white",
              [`&.${inputLabelClasses.shrink}`]: {
                color: "white",
              },
            },
          }}
          label="name"
          id="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <Box sx={{ mr: 2 }} />
        <CssTextField
          InputLabelProps={{
            sx: {
              color: "white",
              [`&.${inputLabelClasses.shrink}`]: {
                color: "white",
              },
            },
          }}
          label="name"
          id="name"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
          }}
        />
      </div>
      <Box sx={{ mb: 2 }} />
      <Button
        onClick={async () => {
          await addUser(name, lastName);
          let response = await readUsers();
          await setUsers(response);
          setLastName("");
          setUsers("");
        }}
        variant="contained"
        style={{ width: '400px' }}
      >
        Agregar
      </Button>
      <Box sx={{ mb: 2 }} />
      <Button
        onClick={async () => {
          let response = await signUp(
            "ricardoandb@gmail.com",
            "siyofueraladronmerobariatusbesos"
          );
          console.log("response", response);
        }}
        variant="contained"
        style={{ width: '400px' }}
      >
        Create User Auth
      </Button>
      <Box sx={{ mb: 2 }} />
      <Button
        onClick={async () => {
          let response = await signIn(
            "ricardoandb@gmail.com",
            "siyofueraladronmerobariatusbesos"
          );
          console.log("response", response);
        }}
        variant="contained"
        style={{ width: '400px' }}
      >
        Login User Auth
      </Button>
      <Box sx={{ mb: 2 }} />
      <Button
        onClick={async () => {
          const response = await getImageUrlByName("one_way.png");
          setImageUrl(response);
          window.open(response);
        }}
        variant="contained"
        style={{ width: '400px' }}

      >
        Get Image
      </Button>

      <Box sx={{ mb: 2 }} />
      <Button onClick={saveImage} variant="contained" style={{ width: '400px' }}> Guardar</Button>

      <Box sx={{ mb: 2 }} />
      <Button onClick={updateImagenData} variant="contained" style={{ width: '400px' }}> Actualizar</Button>

      <Box sx={{ mb: 2 }} />
      <Button onClick={removeImagen} variant="contained" style={{ width: '400px' }}> Eliminar</Button>

      <Box sx={{ mb: 2 }} />
      <input type="text" onChange={e => setImagenId(e.target.value)} placeholder="Identificación" style={{ width: '400px' }} />
    </div>

    <Box sx={{ mb: 2 }} />
    <div class="">
      <label class="">
        <input class="" type="file"
          onChange={(event) => {
            setImagen(event.target.files[0]);
          }} />

      </label>
      <Box sx={{ mb: 4 }} />
    </div>

    
    <div className="m-2">
      <MDBContainer >
        <MDBRow className="row-cols-1 row-cols-md-3 g-4">
          {
            imagenes && imagenes.map(p =>
              <MDBCard key={p.id}>
                <MDBCol size="md" className="mx-5">
                  <MDBCardImage src={p.data().url} position="top" alt="..." style={{ width: '200px', height: 'auto', marginLeft: '-16px' }} />
                  <MDBCardBody>
                    <MDBCardText>{p.id}</MDBCardText>
                  </MDBCardBody>
                </MDBCol>
              </MDBCard>
            )}
        </MDBRow>
      </MDBContainer>
    </div>























  </div>
  );
}

export default App;
